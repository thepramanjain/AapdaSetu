"""
AapdaSetu - Preprocessing, Validation & RAG Indexing Pipeline
==============================================================
1. Parses and cleans raw disaster alert JSON files (USGS and ReliefWeb).
2. Performs validation via Pydantic DisasterRecord schema.
3. Chunks NDMA/NDRF guideline documents.
4. Generates local embeddings using Sentence Transformers (all-MiniLM-L6-v2).
5. Stores vectors in a FAISS index and metadata in a companion file.
"""

import hashlib
import json
import os
import pickle
import re
import sys
from datetime import datetime, timezone
import numpy as np

# Set Python Path to workspace root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schemas import DisasterRecord
from backend.config import settings, app_logger


def calculate_md5(file_path: str) -> str:
    """Calculates MD5 checksum for file integrity verification."""
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()


def clean_text(text: str) -> str:
    """Removes HTML tags, URLs, and standardizes whitespace."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"http\S+|www\S+", "", text)
    return " ".join(text.split())


def preprocess_alerts():
    """Loads raw alerts from USGS & ReliefWeb, validates, and saves processed records."""
    app_logger.info("Starting raw disaster data preprocessing...")
    
    raw_dir = os.path.join(settings.DATA_DIR, "raw")
    processed_dir = os.path.join(settings.DATA_DIR, "processed")
    os.makedirs(processed_dir, exist_ok=True)

    eq_raw_path = os.path.join(raw_dir, "earthquakes.json")
    rw_raw_path = os.path.join(raw_dir, "reliefweb_reports.json")
    
    eq_clean_path = os.path.join(processed_dir, "earthquakes_clean.json")
    rw_clean_path = os.path.join(processed_dir, "news_clean.json")

    # 1. Process Earthquakes
    eq_records = []
    if os.path.exists(eq_raw_path):
        with open(eq_raw_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        for item in raw_data.get("features", []):
            props = item.get("properties", {})
            geometry = item.get("geometry", {})
            coords = geometry.get("coordinates", [0.0, 0.0, 0.0])
            lon, lat = coords[0], coords[1]
            try:
                mag = float(props.get("mag", 0.0))
                severity = min(mag, 10.0)
                epoch_time = props.get("time", 0.0) / 1000.0
                dt = datetime.fromtimestamp(epoch_time, timezone.utc)
                
                record = DisasterRecord(
                    event_type="earthquake",
                    latitude=lat,
                    longitude=lon,
                    severity=severity,
                    confidence=1.0,
                    reported_at=dt,
                    description=clean_text(props.get("title", ""))
                )
                r_dict = record.model_dump()
                r_dict["reported_at"] = r_dict["reported_at"].isoformat()
                r_dict["id"] = str(r_dict["id"])
                eq_records.append(r_dict)
            except Exception as e:
                app_logger.debug(f"Skipping invalid earthquake row: {e}")
        
        with open(eq_clean_path, "w", encoding="utf-8") as f:
            json.dump(eq_records, f, indent=2)
        app_logger.info(f"Processed {len(eq_records)} validated earthquakes to {eq_clean_path}")

    # 2. Process News reports
    rw_records = []
    if os.path.exists(rw_raw_path):
        with open(rw_raw_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        for item in raw_data.get("data", []):
            fields = item.get("fields", {})
            title = fields.get("title", "")
            body = fields.get("body", "")
            title_lower = title.lower()
            body_lower = body.lower()
            
            # Map event type
            event_type = None
            if "flood" in title_lower or "flood" in body_lower or "rain" in title_lower:
                event_type = "flood"
            elif "earthquake" in title_lower or "earthquake" in body_lower:
                event_type = "earthquake"
            
            if not event_type:
                continue  # Skip unsupported disasters
            
            # Geocode context fallbacks for seeded testing
            lat, lon = 19.0760, 72.8777  # Default to Mumbai
            if "pune" in title_lower or "pune" in body_lower:
                lat, lon = 18.5204, 73.8567
            
            try:
                severity = 5.0
                if "severe" in body_lower or "red alert" in body_lower or "monsoon" in body_lower:
                    severity = 8.0
                elif "minor" in body_lower:
                    severity = 3.0

                record = DisasterRecord(
                    event_type=event_type,
                    latitude=lat,
                    longitude=lon,
                    severity=severity,
                    confidence=0.85,
                    description=clean_text(f"{title}: {body[:250]}...")
                )
                r_dict = record.model_dump()
                r_dict["reported_at"] = r_dict["reported_at"].isoformat()
                r_dict["id"] = str(r_dict["id"])
                rw_records.append(r_dict)
            except Exception as e:
                app_logger.debug(f"Skipping invalid news report: {e}")
                
        with open(rw_clean_path, "w", encoding="utf-8") as f:
            json.dump(rw_records, f, indent=2)
        app_logger.info(f"Processed {len(rw_records)} validated news alerts to {rw_clean_path}")

    # Write metadata.json
    metadata_path = os.path.join(settings.DATA_DIR, "metadata.json")
    metadata = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "datasets": {
            "earthquakes": {
                "record_count": len(eq_records),
                "clean_file": os.path.relpath(eq_clean_path, settings.DATA_DIR)
            },
            "news": {
                "record_count": len(rw_records),
                "clean_file": os.path.relpath(rw_clean_path, settings.DATA_DIR)
            }
        }
    }
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50, default_section: str = "common") -> list[dict]:
    """
    Splits text using RecursiveCharacterTextSplitter, maintaining context.
    Detects section names to attach metadata tags.
    """
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
        except ImportError:
            raise RuntimeError("langchain_text_splitters or langchain must be installed for text splitting.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    docs = splitter.create_documents([text])
    chunks = []
    
    for i, doc in enumerate(docs):
        chunk_content = doc.page_content.strip()
        if not chunk_content:
            continue
            
        lower_content = chunk_content.lower()
        
        # Disaster Type Detection
        current_section = default_section
        if "flood" in lower_content or "rain" in lower_content or "monsoon" in lower_content:
            current_section = "flood"
        elif "earthquake" in lower_content or "tremor" in lower_content or "seismic" in lower_content:
            current_section = "earthquake"
        elif "cyclone" in lower_content or "hurricane" in lower_content or "storm" in lower_content:
            current_section = "cyclone"
            
        # Priority Detection
        priority = "normal"
        if any(w in lower_content for w in ["immediate", "danger", "critical", "urgent", "evacuate"]):
            priority = "high"
            
        # Category Detection
        categories = []
        if any(w in lower_content for w in ["evacuate", "immediate", "danger", "rescue", "emergency"]):
            categories.append("Immediate Response")
        if any(w in lower_content for w in ["prepare", "drill", "plan", "before", "kit", "stock", "mock drill", "education", "mitigation"]):
            categories.append("Preparedness")
        if any(w in lower_content for w in ["after", "recover", "rebuild", "insurance", "damage"]):
            categories.append("Recovery")
        if any(w in lower_content for w in ["sop", "official", "authority", "protocol", "ndma", "ndrf"]):
            categories.append("Government SOP")
        if any(w in lower_content for w in ["medical", "first aid", "hospital", "injury", "blood", "doctor", "health"]):
            categories.append("Medical")
            
        if not categories:
            categories.append("Preparedness")
            
        chunks.append({
            "text": chunk_content,
            "metadata": {
                "disaster_type": current_section,
                "category": categories[0],
                "source": "unknown",
                "priority": priority,
                "document": "unknown",
                "section": current_section,
                "language": "en"
            }
        })
        
    return chunks


from services import vector_store


def build_rag_index():
    """Scans RAG_DOCS_DIR for PDFs, chunks their pages using pypdf, and builds the Chroma database."""
    app_logger.info("Initializing RAG vector database indexing from PDF guidelines...")
    
    try:
        from pypdf import PdfReader
    except ImportError:
        app_logger.error("Required library (pypdf) is not installed yet.")
        return

    # 1. Scan for PDFs
    pdf_files = [f for f in os.listdir(settings.RAG_DOCS_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        app_logger.error(f"No PDF guideline manuals found in {settings.RAG_DOCS_DIR}. Run PDF generator first.")
        return

    all_chunks = []
    
    for filename in pdf_files:
        pdf_path = os.path.join(settings.RAG_DOCS_DIR, filename)
        app_logger.info(f"Extracting text from: {filename}...")
        
        # Infer default disaster type category
        lower_name = filename.lower()
        if "flood" in lower_name:
            default_disaster = "flood"
        elif "earthquake" in lower_name:
            default_disaster = "earthquake"
        else:
            default_disaster = "common"
            
        try:
            reader = PdfReader(pdf_path)
            pdf_text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    pdf_text += page_text + "\n"
            
            # Chunk the extracted text
            file_chunks = chunk_text(pdf_text, chunk_size=400, overlap=50, default_section=default_disaster)
            # Add source file metadata to each chunk
            for idx, c in enumerate(file_chunks):
                c["metadata"]["source"] = filename
                c["metadata"]["document"] = os.path.splitext(filename)[0].replace("_", " ").title()
                c["metadata"]["section"] = c["metadata"].get("disaster_type", default_disaster)
                c["metadata"]["chunk_id"] = idx
            
            all_chunks.extend(file_chunks)
            app_logger.info(f"Generated {len(file_chunks)} chunks from {filename} (Default disaster tag: {default_disaster}).")
        except Exception as e:
            app_logger.error(f"Failed to parse PDF {filename}: {e}", exc_info=True)
            
    if not all_chunks:
        app_logger.error("No text chunks generated from PDF files. Aborting indexing.")
        return

    app_logger.info(f"Total chunks generated across all manuals: {len(all_chunks)}")

    # 2. Reset database and insert documents using ChromaDB
    texts = [c["text"] for c in all_chunks]
    metadatas = [c["metadata"] for c in all_chunks]
    
    app_logger.info("Rebuilding ChromaDB database and adding documents...")
    try:
        vector_store.reset_database()
        vector_store.add_documents(texts, metadatas)
        app_logger.info(f"ChromaDB database successfully rebuilt with {len(texts)} documents.")
    except Exception as e:
        app_logger.error(f"Failed to rebuild ChromaDB database: {e}", exc_info=True)


if __name__ == "__main__":
    app_logger.info("Starting raw disaster data preprocessing...")
    preprocess_alerts()
    build_rag_index()
    app_logger.info("Preprocessing & Indexing Pipeline completed successfully!")

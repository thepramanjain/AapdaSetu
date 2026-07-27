import os
import re
import json
import shutil
import hashlib
import numpy as np
from typing import List, Dict, Any

# Attempt to load native ChromaDB libraries at module import time
try:
    
    from langchain_chroma import Chroma
    import chromadb
    _USE_FALLBACK = False
except (ImportError, ModuleNotFoundError) as e:
    from backend.config import app_logger
    app_logger.warning(
        f"Vector Store: Failed to import chromadb due to system bindings mismatch ({e}). "
        f"Activating pure-Python FallbackChroma database..."
    )
    _USE_FALLBACK = True

from backend.config import settings, app_logger





_EMBEDDING_MODEL = None
_VECTOR_STORE = None
# Retriever cache: keyed by (k, filter_json_str) -> retriever object
_RETRIEVER_CACHE: dict = {}

def get_embedding_model():
    """
    Initializes and returns the embedding model.
    Implements provider selection once and caches the result.
    """
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is not None:
        return _EMBEDDING_MODEL

    provider = getattr(settings, "EMBEDDING_PROVIDER", "").lower()
    model_name = getattr(settings, "EMBEDDING_MODEL", "")

    # If explicitly HuggingFace, BAAI model requested, or provider isn't Gemini
    if provider != "gemini" or "BAAI" in model_name:
        app_logger.info("Vector Store: Using HuggingFace embedding provider.")
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            _EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
            return _EMBEDDING_MODEL
        except ImportError:
            raise RuntimeError("Vector Store: langchain_huggingface is not installed. Please install it.")

    # Gemini requested explicitly
    key = settings.GEMINI_API_KEY
    if not key or key == "mock_api_key_value_for_testing":
        app_logger.warning("Vector Store: GEMINI_API_KEY missing or invalid. Falling back to HuggingFace.")
        from langchain_huggingface import HuggingFaceEmbeddings
        _EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        return _EMBEDDING_MODEL
        
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        use_model_name = model_name if model_name else "models/text-embedding-004"
        app_logger.info(f"Vector Store: Loading GoogleGenerativeAIEmbeddings model {use_model_name}...")
        model = GoogleGenerativeAIEmbeddings(model=use_model_name, google_api_key=key)
        model.embed_query("connection check")
        _EMBEDDING_MODEL = model
        return _EMBEDDING_MODEL
    except Exception as e:
        app_logger.warning(f"Vector Store: Gemini embedding model failed: {e}. Falling back to HuggingFace.")
        from langchain_huggingface import HuggingFaceEmbeddings
        _EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        return _EMBEDDING_MODEL


collection_name = "ndma_guidelines"


class FallbackChroma:
    """
    A pure-Python fallback vector store that behaves like Chroma but stores vectors 
    in a local JSON file. This ensures that the application, preprocessing, 
    and test suites continue to function even if the native chromadb binary fails to load.
    """
    def __init__(self, collection_name: str, embedding_function, persist_directory: str):
        self.collection_name = collection_name
        self.embedding_function = embedding_function
        self.persist_directory = persist_directory
        self.data_file = os.path.join(persist_directory, "fallback_db.json")
        self.documents = []
        self._load()

    def _load(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                app_logger.warning(f"Fallback DB: Failed to load: {e}")

    def _save(self):
        os.makedirs(self.persist_directory, exist_ok=True)
        try:
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(self.documents, f, indent=2)
        except Exception as e:
            app_logger.error(f"Fallback DB: Failed to save: {e}")

    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]] = None):
        metadatas = metadatas or [{} for _ in texts]
        embeddings = self.embedding_function.embed_documents(texts)
        for text, meta, emb in zip(texts, metadatas, embeddings):
            self.documents.append({
                "page_content": text,
                "metadata": meta,
                "embedding": emb
            })
        self._save()

    def delete_collection(self):
        self.documents = []
        if os.path.exists(self.data_file):
            try:
                os.remove(self.data_file)
            except Exception:
                pass

    def similarity_search_with_score(self, query: str, k: int = 3, filter: Dict[str, Any] = None) -> list:
        # 1. Embed query
        query_emb = np.array(self.embedding_function.embed_query(query))
        
        # 2. Score and filter documents
        scored_docs = []
        for doc in self.documents:
            meta = doc["metadata"]
            
            # Apply filter if specified
            if filter:
                if not self._matches_filter(meta, filter):
                    continue
            
            doc_emb = np.array(doc["embedding"])
            dist = np.linalg.norm(query_emb - doc_emb)
            
            from langchain_core.documents import Document
            lc_doc = Document(page_content=doc["page_content"], metadata=meta)
            scored_docs.append((lc_doc, dist))
            
        scored_docs.sort(key=lambda x: x[1])
        return scored_docs[:k]

    def _matches_filter(self, metadata: dict, filter_cond: dict) -> bool:
        if not filter_cond:
            return True
            
        if "$or" in filter_cond:
            for sub_cond in filter_cond["$or"]:
                if self._matches_filter(metadata, sub_cond):
                    return True
            return False
            
        if "$and" in filter_cond:
            for sub_cond in filter_cond["$and"]:
                if not self._matches_filter(metadata, sub_cond):
                    return False
            return True
            
        for key, val in filter_cond.items():
            if isinstance(val, dict):
                if "$in" in val:
                    if metadata.get(key) not in val["$in"]:
                        return False
                else:
                    if metadata.get(key) != val:
                        return False
            else:
                if metadata.get(key) != val:
                    return False
        return True

    def as_retriever(self, search_type: str = "similarity", search_kwargs: dict = None):
        class FallbackRetriever:
            def __init__(self, store, kwargs):
                self.store = store
                self.kwargs = kwargs or {}
            def get_relevant_documents(self, query: str):
                k = self.kwargs.get("k", 3)
                filt = self.kwargs.get("filter")
                scored = self.store.similarity_search_with_score(query, k=k, filter=filt)
                return [doc for doc, _ in scored]
        return FallbackRetriever(self, search_kwargs)


def _get_vector_store():
    """Helper to initialize the vector store instance (native or fallback)."""
    global _USE_FALLBACK, _VECTOR_STORE
    
    if _VECTOR_STORE is not None:
        return _VECTOR_STORE
        
    embedding = get_embedding_model()
    
    if not _USE_FALLBACK:
        try:
            # Try initializing the real Chroma client
            db = Chroma(
                collection_name=collection_name,
                embedding_function=embedding,
                persist_directory=settings.VECTOR_DB_PATH
            )
            # Access underlying client to check for lazy DLL load failures
            _ = db._client
            _VECTOR_STORE = db
            return _VECTOR_STORE
        except Exception as e:
            app_logger.warning(
                f"Vector Store: Failed to initialize native Chroma client: {e}. "
                "Switching to pure-Python FallbackChroma database..."
            )
            _USE_FALLBACK = True
            
    # Fallback to FallbackChroma
    _VECTOR_STORE = FallbackChroma(
        collection_name=collection_name,
        embedding_function=embedding,
        persist_directory=settings.VECTOR_DB_PATH
    )
    return _VECTOR_STORE


def add_documents(texts: List[str], metadatas: List[Dict[str, Any]]):
    """
    Adds raw texts with metadatas to the vector store.
    """
    db = _get_vector_store()
    db.add_texts(texts=texts, metadatas=metadatas)
    app_logger.info(f"Vector Store: Added {len(texts)} documents to collection '{collection_name}'")


def similarity_search(query: str, k: int = 3, filter_dict: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Runs similarity search on vector store.
    
    Args:
        query: Search query text.
        k: Top K nearest neighbors.
        filter_dict: Dictionary representing metadata filters (e.g. {"disaster_type": "flood"}).
        
    Returns:
        List[Dict]: Matching documents matching the expected layout:
                   {"text": page_content, "score": float, "metadata": dict}
    """
    db = _get_vector_store()
    
    # Format metadata filter if provided
    where = None
    if filter_dict:
        if "disaster_type" in filter_dict:
            dt = filter_dict["disaster_type"]
            if dt and dt != "common":
                where = {"$or": [{"disaster_type": dt}, {"disaster_type": "common"}]}
            else:
                where = {"disaster_type": "common"}
        else:
            where = filter_dict
            
    docs_and_scores = db.similarity_search_with_score(query, k=k, filter=where)
    
    results = []
    for doc, score in docs_and_scores:
        results.append({
            "text": doc.page_content,
            "score": round(float(score), 4),
            "metadata": doc.metadata
        })
    return results


def delete_collection():
    """Deletes the collection from the vector store."""
    try:
        db = _get_vector_store()
        db.delete_collection()
        app_logger.info(f"Vector Store: Deleted collection '{collection_name}' successfully.")
    except Exception as e:
        app_logger.warning(f"Vector Store: Failed to delete collection '{collection_name}': {e}")


def reset_database():
    """Wipes the database directory and recreates it to ensure a fresh build."""
    import time
    import gc
    global _VECTOR_STORE
    
    try:
        delete_collection()
    except Exception:
        pass
        
    _VECTOR_STORE = None
    
    # Attempt to clear ChromaDB system cache to release SQLite file locks (WinError 32)
    try:
        import chromadb
        if hasattr(chromadb.api.client.SharedSystemClient, 'clear_system_cache'):
            chromadb.api.client.SharedSystemClient.clear_system_cache()
    except Exception:
        pass
        
    # Force garbage collection to release unreferenced file handles
    gc.collect()
    
    if os.path.exists(settings.VECTOR_DB_PATH):
        max_retries = 3
        for attempt in range(max_retries + 1):
            try:
                shutil.rmtree(settings.VECTOR_DB_PATH)
                app_logger.info("Vector Store: Persistent directory deleted.")
                break
            except Exception as e:
                if attempt < max_retries:
                    sleep_time = 2 ** attempt
                    app_logger.warning(f"Vector Store: Failed to delete persistent directory (locked). Retrying in {sleep_time}s... ({e})")
                    time.sleep(sleep_time)
                else:
                    app_logger.warning(f"Vector Store: Could not delete persistent directory after retries due to lock. Reusing existing directory. Error: {e}")
            
    os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)


def get_retriever(k: int = 3, filter_dict: Dict[str, Any] = None):
    """
    Returns a LangChain retriever interface for the vector store.

    Retriever instances are cached by (k, filter) key so repeated calls
    (e.g. one per RAG query) do NOT recreate the retriever object.
    """
    global _RETRIEVER_CACHE
    import json as _json

    # Build a stable cache key
    try:
        filter_key = _json.dumps(filter_dict, sort_keys=True) if filter_dict else "null"
    except Exception:
        filter_key = str(filter_dict)

    cache_key = (k, filter_key)
    if cache_key in _RETRIEVER_CACHE:
        return _RETRIEVER_CACHE[cache_key]

    db = _get_vector_store()
    where = None
    if filter_dict:
        if "disaster_type" in filter_dict:
            dt = filter_dict["disaster_type"]
            if dt and dt != "common":
                where = {"$or": [{"disaster_type": dt}, {"disaster_type": "common"}]}
            else:
                where = {"disaster_type": "common"}
        else:
            where = filter_dict

    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k, "filter": where}
    )
    _RETRIEVER_CACHE[cache_key] = retriever
    return retriever

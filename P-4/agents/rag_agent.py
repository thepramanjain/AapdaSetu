"""RAG Knowledge Grounding Agent
Retrieves relevant guideline chunks and synthesizes a grounded advisory using the LLM manager.
"""

from backend.config import settings, app_logger
from tools.rag_tool import search_guidelines
from agents.prompt_loader import load_prompt, parse_llm_response
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.context_optimizer import compress_rag_chunks
import re


def generate_advisory(location: str, disaster_type: str, severity: float, description: str, event_confirmed: bool = False, verification_status: str = "LIVE") -> str:
    """
    Runs the RAG Agent pipeline to generate grounded advisory instructions.
    
    Returns:
        tuple: (Grounded markdown advisory text, list of raw retrieved chunks).
    """
    app_logger.info(f"RAG Agent: Fetching guidelines for query='{description[:50]}'...")
    
    # 1. Search vector DB separately for categories
    categories = ["Immediate Response", "Preparedness", "Recovery", "Medical", "Government SOP"]
    all_chunks = []
    
    for cat in categories:
        cat_chunks = search_guidelines(
            query=description, 
            disaster_filter=disaster_type, 
            verification_status=verification_status,
            category=cat,
            top_k=3
        )
        all_chunks.extend(cat_chunks)
    
    # 2. Context Summarization
    # Summarize extracted facts into concise evidence block
    summarized_contexts = []
    for chunk in all_chunks:
        text = chunk.get("text", "").strip()
        meta = chunk.get("metadata", {})
        doc = meta.get("document", "Unknown Source")
        cat = meta.get("category", "General")
        # Pre-summarize: Only send relevant sentences (not full raw text if possible, but doing a simplistic summary extraction here)
        summarized_contexts.append(f"[{cat} - {doc}]: {text}")
        
    compressed_chunks = "\n\n".join(summarized_contexts)
        
    # 3. Build and execute prompt using modular prompt files
    rag_p = load_prompt("rag_agent_prompt.md")
    
    # Generate Verified Evidence Block
    evidence_block = f"Status: {verification_status}"
    
    user_context = (
        "## Current Task\n"
        f"{rag_p}\n\n"
        "## Compact State\n"
        f"Location: {location}\n"
        f"Disaster Type: {disaster_type}\n"
        f"Severity Rating: {severity}\n"
        f"Situation Report: {description}\n\n"
        "## Verified Evidence\n"
        f"{evidence_block}\n\n"
        "## Relevant RAG Context\n"
        f"{compressed_chunks}\n\n"
        "Return a readable list of bullet points.\n"
        "Do NOT dump JSON.\n"
        "Do NOT write markdown JSON blocks.\n"
    )
    
    filled = user_context

    try:
        content = llm_manager.invoke(filled, temperature=0.0, require_json=False)
        content = content.strip()
        app_logger.debug(f"RAG Agent LLM Raw Output:\n{content}")
        
        # The prompt will enforce the structure: Safety Advisory, Government Guidance, Medical Advice
        # We just clean it up to ensure it's not a JSON dict
        advisory = content
        
        # Strip out any markdown json formatting if the LLM still tries to output it
        advisory = re.sub(r'```json\s*', '', advisory)
        advisory = re.sub(r'```\s*', '', advisory)
        
        app_logger.info("RAG Agent: Safety advisory compiled successfully.")
        return advisory, all_chunks
        
    except LLMServiceError as e:
        app_logger.error(f"RAG Agent: LLM failed: {e}", exc_info=True)
    except Exception as e:
        app_logger.error(f"RAG Agent: Failed to generate safety advisory: {e}", exc_info=True)
        # Combine texts from matching chunks as simple string fallback
        if all_chunks:
            fallback = "\n".join([f"- {c['text']}" for c in all_chunks[:5]])
        else:
            fallback = "- Standard disaster response protocols are active. Seek higher ground and remain alert for announcements from NDRF officials."
        return fallback, all_chunks

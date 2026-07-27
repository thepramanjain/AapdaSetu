"""
AapdaSetu - RAG Vector Search Tool
======================================
Performs vector similarity search on the local ChromaDB database.
Filters results by disaster type metadata to prevent hallucinated recommendations.
"""

from typing import List, Dict, Any, Optional
from backend.config import settings, app_logger


def _load_rag_resources():
    """Warms up the vector store embedding model client connection on boot."""
    try:
        from services import vector_store
        vector_store.get_embedding_model()
        return True
    except Exception as e:
        app_logger.error(f"RAG Tool: Warm-up failed: {e}")
        return False


def _get_static_fallback(disaster_filter: Optional[str]) -> List[Dict[str, Any]]:
    """Returns static NDMA fallback guidelines when index loading or search fails."""
    app_logger.warning("RAG Tool: Using static fallback guidance database.")
    fallback_text = ""
    if disaster_filter == "flood":
        fallback_text = (
            "NDMA Flood Guidelines: Evacuate along pre-identified safe routes. "
            "Move to higher ground. Turn off main electricity switches and gas valves to prevent hazards. "
            "Store dry rations and clean drinking water. Avoid walking/driving through moving water."
        )
    elif disaster_filter == "earthquake":
        fallback_text = (
            "NDMA Earthquake Guidelines: If ground shaking begins, DROP, COVER, and HOLD ON. "
            "Stay away from glass windows and heavy fixtures. Cover head/neck with a pillow if in bed. "
            "Watch out for aftershocks. Inspect load-bearing columns for diagonal cracks. Smell for gas leaks."
        )
    else:
        fallback_text = (
            "NDMA General Guidelines: Cooperate with rescue teams (NDRF). "
            "Keep emergency contacts active. Access designated municipal shelters. Ensure minimum water "
            "standard of 15 liters per person per day."
        )
        
    return [{
        "text": fallback_text,
        "score": 0.0,
        "metadata": {"disaster_type": disaster_filter or "common", "source": "static_fallback"}
    }]


def search_guidelines(query: str, disaster_filter: Optional[str] = None, verification_status: str = "LIVE", category: Optional[str] = None, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Search the NDMA guidelines vector store for matching guidelines.
    
    Args:
        query: Query string.
        disaster_filter: Filter results by disaster metadata ('flood', 'earthquake', 'common').
        verification_status: LIVE, PREPAREDNESS, HISTORICAL, SIMULATION.
        category: Specific category to search for.
        top_k: Number of matching chunks to return.
        
    Returns:
        List[Dict]: List of matching chunks with text, scores, and metadata.
    """
    if not query or not query.strip():
        return []

    try:
        from services import vector_store
        # We query the vector store with metadata filtering
        filter_dict = {}
        conditions = []
        
        if disaster_filter:
            conditions.append({"disaster_type": disaster_filter})
            
        if category:
            conditions.append({"category": category})
        else:
            if verification_status == "LIVE":
                conditions.append({"category": {"$in": ["Immediate Response", "Medical", "Evacuation", "Government SOP"]}})
            elif verification_status == "PREPAREDNESS":
                conditions.append({"category": {"$in": ["Preparedness", "Education", "Mitigation", "Mock Drills"]}})
            elif verification_status == "HISTORICAL":
                conditions.append({"category": {"$in": ["Recovery", "Relief", "Infrastructure"]}})
            
        if len(conditions) > 1:
            filter_dict = {"$and": conditions}
        elif len(conditions) == 1:
            filter_dict = conditions[0]
            
        results = vector_store.similarity_search(query, k=top_k * 5, filter_dict=filter_dict)
        if not results:
            return _get_static_fallback(disaster_filter)
            
        # Deduplicate chunks based on text content (remove duplicate paragraphs/SOPs)
        unique_results = []
        seen_texts = set()
        for res in results:
            # Normalize to catch slight variations
            text_hash = hash("".join(res["text"].lower().split()))
            if text_hash not in seen_texts:
                seen_texts.add(text_hash)
                unique_results.append(res)
                
        if not unique_results:
            return _get_static_fallback(disaster_filter)
            
        # Re-ranking: Similarity Score + Metadata Match + Priority + Recency
        for res in unique_results:
            base_score = res.get("score", 0.0)
            bonus = 0.0
            meta = res.get("metadata", {})
            
            # Priority
            if meta.get("priority") == "high":
                bonus -= 0.1  # lower score is better in chroma/faiss L2 distance
                
            # Metadata Match
            if category and meta.get("category") == category:
                bonus -= 0.15
            if disaster_filter and meta.get("disaster_type") == disaster_filter:
                bonus -= 0.15
                
            res["rerank_score"] = base_score + bonus
            
        # Sort by rerank score ascending (assuming lower distance is better)
        unique_results.sort(key=lambda x: x["rerank_score"])
            
        # Top 3 Chunks
        return unique_results[:top_k]
        
    except Exception as e:
        app_logger.error(f"RAG Tool: Search query execution failed: {e}", exc_info=True)
        return _get_static_fallback(disaster_filter)

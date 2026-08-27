"""
AapdaSetu - Intent and Entity Parser
====================================
Parses natural language queries to extract location, disaster type, intent, and time context.
"""

import json
from backend.config import app_logger
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json

def parse_intent(query: str) -> dict:
    """
    Extracts structured entities and user intent from a natural language disaster query.
    
    Args:
        query (str): The natural language query from the user.
        
    Returns:
        dict: A dictionary containing 'location', 'disaster', 'intent', and 'time_context'.
              Values are None if they could not be determined.
    """
    prompt = f"""You are an AI disaster intelligence parser. 
Extract the following information from the user's natural language query.
Return ONLY a valid JSON object. Do not include markdown formatting, backticks, or explanations.

Query: "{query}"

Expected JSON format:
{{
  "location": "extracted location or null if none",
  "disaster": "flood, earthquake, or null if none",
  "intents": ["Risk Assessment", "Resource Search", "Mission Recommendation", "Budget Request", "Report Generation"] (list of applicable intents based on the query. If none specific, return ["General"]),
  "time_context": "Current, Past, Future, or null"
}}

Return ONLY valid JSON.
Do NOT explain.
Do NOT use markdown.
Do NOT use code fences.
Do NOT think aloud.
The first character must be {{
The last character must be }}
"""
    
    default_response = {
        "location": None,
        "disaster": None,
        "intents": ["General"],
        "time_context": None
    }
    
    try:
        response = llm_manager.invoke(prompt, temperature=0.0, require_json=True)
        parsed_data = parse_strict_json(response)
        
        # Ensure correct types and fallback to None if empty string
        return {
            "location": parsed_data.get("location") or None,
            "disaster": parsed_data.get("disaster") or None,
            "intents": parsed_data.get("intents") or ["General"],
            "time_context": parsed_data.get("time_context") or None
        }
        
    except LLMServiceError as e:
        app_logger.error(f"Intent Parser LLM Error: {e}")
        return default_response
    except ValueError as e:
        app_logger.error(f"Intent Parser JSON Decode Error: {e}. Raw response: {response}")
        return default_response
    except Exception as e:
        app_logger.error(f"Intent Parser Unexpected Error: {e}")
        return default_response

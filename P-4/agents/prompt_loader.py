import os
import re
import json
import yaml
from backend.config import BASE_DIR, app_logger

PROMPTS_DIR = os.path.join(BASE_DIR, "prompts")

def load_prompt(filename: str) -> str:
    """
    Loads a prompt content from the prompts/ directory.
    """
    path = os.path.join(PROMPTS_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        app_logger.error(f"Failed to load prompt from {path}: {e}")
        raise e

def parse_llm_response(content: str) -> dict:
    """
    Parses JSON or YAML from LLM output block.
    """
    content_clean = content.strip()
    
    # 1. Try finding JSON block first
    json_match = re.search(r"```json\s*(.*?)\s*```", content_clean, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except Exception as e:
            app_logger.warning(f"Failed to parse matching json block: {e}")
            
    # 2. Try finding YAML block
    yaml_match = re.search(r"```yaml\s*(.*?)\s*```", content_clean, re.DOTALL)
    if yaml_match:
        try:
            return yaml.safe_load(yaml_match.group(1))
        except Exception as e:
            app_logger.warning(f"Failed to parse matching yaml block: {e}")

    # 3. Try raw JSON load after stripping markdown blocks
    try:
        raw_text = re.sub(r"```(json|yaml)?|```", "", content_clean).strip()
        return json.loads(raw_text)
    except Exception:
        pass
        
    # 4. Try raw YAML load after stripping markdown blocks
    try:
        raw_text = re.sub(r"```(json|yaml)?|```", "", content_clean).strip()
        return yaml.safe_load(raw_text)
    except Exception:
        pass
        
    raise ValueError(f"Could not parse LLM output as JSON or YAML. Raw output:\n{content}")

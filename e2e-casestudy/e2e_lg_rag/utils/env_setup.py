import os
import getpass
from dotenv import load_dotenv

def load_environment():
    """
    Load environment variables from .env file and prompt for missing ones
    """
    load_dotenv(override=True)
    _set_env("OPENAI_API_KEY")
    
    model_name = os.getenv("OLLAMA_MODEL", "mistral")
    ollama_base_url = os.getenv("OLLAMA_BASE_URL")
    
    return model_name, ollama_base_url

def _set_env(key: str):
    """
    Set environment variable if not present
    """
    if key not in os.environ:
        os.environ[key] = getpass.getpass(f"{key}:")

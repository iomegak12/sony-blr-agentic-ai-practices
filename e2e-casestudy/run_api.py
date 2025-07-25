import uvicorn
import sys
from e2e_lg_rag.utils.logging_config import setup_logging, get_logger

# Setup logging
setup_logging(log_level="INFO", log_file="logs/run_api.log")
logger = get_logger("run_api")

def main():
    try:
        logger.info("Initializing Self-RAG API server...")
        logger.info("Starting server on host 0.0.0.0:8000")
        
        uvicorn.run(
            "e2e_lg_rag.api:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=True,
            log_level="info"
        )
    except ImportError as e:
        logger.exception(f"Failed to import required modules: {e}")
        logger.error("Please make sure all dependencies are installed with 'pip install -r requirements.txt'")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"An unexpected error occurred while starting the server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

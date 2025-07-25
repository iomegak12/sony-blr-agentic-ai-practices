"""
Logging configuration using loguru
"""
import sys
from loguru import logger
from pathlib import Path

def setup_logging(log_level: str = "INFO", log_file: str = None):
    """
    Setup loguru logging configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
    """
    # Remove default handler
    logger.remove()
    
    # Add console handler with colorized output and stack traces
    logger.add(
        sys.stdout,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        backtrace=True,
        diagnose=True,
        catch=True
    )
    
    # Add file handler if log_file is specified
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            log_file,
            level=log_level,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            rotation="100 MB",
            retention="30 days",
            backtrace=True,
            diagnose=True,
            catch=True
        )
    
    return logger

def get_logger(name: str = None):
    """
    Get a logger instance
    
    Args:
        name: Logger name (optional)
    
    Returns:
        Configured logger instance
    """
    if name:
        return logger.bind(name=name)
    return logger

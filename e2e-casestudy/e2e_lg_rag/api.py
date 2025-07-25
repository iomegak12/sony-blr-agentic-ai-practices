from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import time
import traceback
import os
from pathlib import Path
from e2e_lg_rag.main import SelfRAG
from e2e_lg_rag.utils.logging_config import setup_logging, get_logger

# Setup logging
setup_logging(log_level="INFO", log_file="logs/self_rag_api.log")
logger = get_logger("self_rag_api")

# Create Pydantic models for request and response
class QuestionRequest(BaseModel):
    question: str = Field(..., description="The question to ask the Self-RAG system")
    urls: Optional[List[str]] = Field(None, description="Optional list of URLs to use as data sources")

class AnswerResponse(BaseModel):
    answer: str = Field(..., description="The generated answer from the Self-RAG system")
    execution_time: float = Field(..., description="Time taken to generate the answer in seconds")

class HealthResponse(BaseModel):
    status: str = Field("ok", description="API health status")
    version: str = Field("1.0.0", description="API version")
    timestamp: float = Field(..., description="Current server timestamp")

# Create FastAPI app
app = FastAPI(
    title="Self-RAG API",
    description="API for a Self-RAG system using LangGraph for RAG with self-reflection capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Get the directory containing this file
current_dir = Path(__file__).parent.parent
public_dir = current_dir / "public"

# Mount static files if public directory exists
if public_dir.exists():
    app.mount("/static", StaticFiles(directory=str(public_dir)), name="static")
    logger.info(f"Static files mounted from: {public_dir}")
else:
    logger.warning(f"Public directory not found at: {public_dir}")

# Custom exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to catch all unhandled exceptions
    """
    logger.exception(f"Unhandled exception occurred: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error occurred",
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "traceback": traceback.format_exc() if logger.level("DEBUG").no <= logger._core.min_level else None
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom HTTP exception handler
    """
    logger.error(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_type": "HTTPException",
            "status_code": exc.status_code
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom validation exception handler
    """
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "error_type": "RequestValidationError",
            "errors": exc.errors()
        }
    )

@app.get("/", include_in_schema=False)
async def serve_frontend():
    """
    Serve the main frontend HTML file.
    """
    html_file = public_dir / "index.html"
    if html_file.exists():
        return FileResponse(str(html_file))
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Frontend not found. Please ensure the public directory contains index.html"
        )

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the API is running correctly.
    """
    try:
        logger.info("Health check requested")
        response = {
            "status": "ok",
            "version": "1.0.0",
            "timestamp": time.time()
        }
        logger.debug(f"Health check response: {response}")
        return response
    except Exception as e:
        logger.exception("Error during health check")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )

@app.post("/generate", response_model=AnswerResponse, tags=["RAG"])
async def generate_answer(request: QuestionRequest):
    """
    Generate an answer to a question using the Self-RAG system.
    
    Optionally provide URLs to use as data sources.
    """
    request_id = f"req_{int(time.time() * 1000000)}"
    logger.info(f"[{request_id}] Starting answer generation", extra={"request_id": request_id})
    logger.debug(f"[{request_id}] Request details: question='{request.question}', urls={request.urls}")
    
    start_time = time.time()
    
    try:
        # Validate request
        if not request.question or not request.question.strip():
            logger.warning(f"[{request_id}] Empty question provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        logger.info(f"[{request_id}] Creating SelfRAG instance")
        
        # Create a SelfRAG instance with the provided URLs
        # If URLs list is empty, pass None to use defaults
        urls_to_use = request.urls if request.urls else None
        logger.debug(f"[{request_id}] URLs to use: {urls_to_use}")
        
        try:
            self_rag = SelfRAG(urls=urls_to_use)
            logger.info(f"[{request_id}] SelfRAG instance created successfully")
        except Exception as e:
            logger.exception(f"[{request_id}] Failed to create SelfRAG instance")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize Self-RAG system: {str(e)}"
            )
        
        logger.info(f"[{request_id}] Running Self-RAG inference")
        
        # Generate answer
        try:
            answer = self_rag.run(request.question)
            logger.info(f"[{request_id}] Answer generated successfully")
            logger.debug(f"[{request_id}] Generated answer: {answer[:200]}{'...' if len(answer) > 200 else ''}")
        except Exception as e:
            logger.exception(f"[{request_id}] Failed to generate answer")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate answer: {str(e)}"
            )
        
        # Calculate execution time
        execution_time = time.time() - start_time
        
        response = {
            "answer": answer,
            "execution_time": execution_time
        }
        
        logger.info(f"[{request_id}] Request completed successfully in {execution_time:.2f}s")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions
        execution_time = time.time() - start_time
        logger.error(f"[{request_id}] Request failed after {execution_time:.2f}s")
        raise
    except Exception as e:
        execution_time = time.time() - start_time
        logger.exception(f"[{request_id}] Unexpected error after {execution_time:.2f}s: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

if __name__ == "__main__":
    logger.info("Starting Self-RAG API server...")
    try:
        uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        logger.exception("Failed to start API server")
        raise

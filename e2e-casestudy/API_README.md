# Self-RAG API

This API provides a REST interface to the Self-RAG system using FastAPI and Uvicorn.

## Features

- Self-RAG system with self-reflection capabilities
- FastAPI REST endpoints
- CORS support
- Health check endpoint
- Swagger and OpenAPI documentation
- Comprehensive logging with Loguru
- Detailed error handling with stack traces
- Request tracking and performance monitoring

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Running the API

To start the API server:

```bash
python run_api.py
```

The API will be available at http://localhost:8000

## Logging

The application uses Loguru for comprehensive logging:

- **Console Logs**: Colorized output with detailed formatting
- **File Logs**: Stored in `logs/` directory with rotation and retention
- **Stack Traces**: Full stack traces for debugging (displayed in console)
- **Request Tracking**: Each request gets a unique ID for tracking
- **Performance Monitoring**: Execution time tracking for all operations

Log files:
- `logs/self_rag_api.log` - Main API logs
- `logs/run_api.log` - Server startup logs

## Error Handling

The API includes comprehensive error handling:

- **Global Exception Handler**: Catches all unhandled exceptions
- **HTTP Exception Handler**: Handles FastAPI HTTP exceptions
- **Validation Error Handler**: Handles request validation errors
- **Stack Traces**: Full stack traces in development mode
- **Request Context**: Error messages include request context and timing

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Endpoints

### Health Check

- `GET /health` - Check if the API is running correctly

### RAG

- `POST /generate` - Generate an answer to a question using the Self-RAG system

## Example Usage

### Using curl

```bash
curl -X POST "http://localhost:8000/generate" \
     -H "Content-Type: application/json" \
     -d '{"question":"What are the key components of an AI agent?", "urls":["https://lilianweng.github.io/posts/2023-06-23-agent/"]}'
```

### Using Python

```python
import requests

url = "http://localhost:8000/generate"
payload = {
    "question": "What are the key components of an AI agent?",
    "urls": ["https://lilianweng.github.io/posts/2023-06-23-agent/"]
}

response = requests.post(url, json=payload)
print(response.json())
```

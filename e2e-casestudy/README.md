# Self-RAG with LangGraph

This project implements a Self-RAG (Retrieval Augmented Generation) system using LangGraph for orchestrating the workflow. The system includes self-reflection capabilities through various graders that evaluate document relevance, hallucination detection, and answer quality.

## Project Structure

```
e2e-casestudy/
├── e2e-lg-rag/         # Main project directory
│   ├── components/      # Components for grading, transforming, and generating
│   │   ├── graders.py   # Document, hallucination, and answer graders
│   │   ├── generator.py # RAG generation components
│   │   └── transformers.py # Question rewriting components
│   ├── data/            # Data loading and vectorstore setup
│   │   └── loader.py    # Functions for loading data and setting up retrieval
│   ├── models/          # Data models and schemas
│   │   └── schema.py    # Pydantic models for grading and graph state
│   ├── utils/           # Utility functions
│   │   └── env_setup.py # Environment setup utilities
│   ├── workflows/       # Workflow definitions
│   │   └── rag_workflow.py # LangGraph workflow definition
│   └── main.py          # Main SelfRAG class
├── archives/            # Archive of older files and notebooks
├── experiments/         # Jupyter notebooks for experiments and demos
│   └── demo_notebook.ipynb # Demo notebook showing usage
├── LICENSE              # MIT License file
├── .gitignore           # Git ignore file
└── requirements.txt     # Project dependencies
```

## Installation

1. Clone the repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:

```
OPENAI_API_KEY=your_openai_api_key
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
```

## Usage

You can use the system in two ways:

### 1. From Python code

```python
import sys
sys.path.append('path/to/e2e-casestudy')
from e2e_lg_rag.main import SelfRAG

# Initialize with default or custom URLs
self_rag = SelfRAG(urls=[
    "https://example.com/document1",
    "https://example.com/document2"
])

# Run a query
answer = self_rag.run("Your question here?")
print(answer)
```

### 2. From the Demo Notebook

Open and run `experiments/demo_notebook.ipynb` to see the system in action with examples.

## Features

- **Modular Design**: Each component is modularized for easy customization
- **Self-Reflection**: The system evaluates its own outputs for quality
- **Document Relevance Grading**: Filters out irrelevant documents
- **Hallucination Detection**: Ensures generated content is grounded in facts
- **Answer Quality Assessment**: Checks if the answer addresses the question
- **Question Rewriting**: Improves retrieval by rewriting poorly formulated questions

## Requirements

- Python 3.8+
- LangGraph
- LangChain
- OpenAI API key or Ollama local models
- ChromaDB for vector storage

"""
Data Ingestion Pipeline for RAG (Retrieval-Augmented Generation) System

This module provides a modularized approach to ingesting documents into a Pinecone vector database.
The design follows object-oriented principles and includes the following main components:

1. Config: Configuration management for environment variables
2. DocumentProcessor: Abstract base class for document processing (with PDFProcessor implementation)
3. EmbeddingService: Service for creating and managing embeddings
4. VectorStoreService: Service for vector store operations with Pinecone
5. DocumentIngestionPipeline: Main orchestration class that combines all services

Key Features:
- Modular design with clear separation of concerns
- Error handling and validation
- Support for different document types (extensible via DocumentProcessor)
- Configurable embedding models and dimensions
- Batch processing of documents

Usage:
    pipeline = DocumentIngestionPipeline()
    pipeline.ingest_from_directory("path/to/pdf/directory")
"""

import os
from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass

from dotenv import load_dotenv
from pypdf import PdfReader

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.schema import Document
from langchain_pinecone import PineconeVectorStore

load_dotenv()


@dataclass
class Config:
    """Configuration class to hold environment variables and settings.
    
    This class centralizes the management of all configuration parameters needed
    for the data ingestion pipeline, including API keys and service configurations.
    
    Attributes:
        openai_api_key (str): API key for OpenAI services
        pinecone_api_key (str): API key for Pinecone vector database
        pinecone_index_name (str): Name of the Pinecone index to use
    
    Raises:
        ValueError: If any required environment variable is not set
    """
    
    def __init__(self):
        """Initialize configuration by loading environment variables.
        
        Loads all required environment variables and validates their presence.
        Automatically calls validation to ensure all required settings are available.
        
        Raises:
            ValueError: If any required environment variable is missing
        """
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")
        
        self._validate_config()
    
    def _validate_config(self) -> None:
        """Validate that all required environment variables are set.
        
        Checks each required configuration parameter and raises ValueError
        if any are missing. This ensures the pipeline cannot start with
        incomplete configuration.
        
        Raises:
            ValueError: If OPENAI_API_KEY is not set
            ValueError: If PINECONE_API_KEY is not set  
            ValueError: If PINECONE_INDEX_NAME is not set
        """
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set.")
        
        if not self.pinecone_api_key:
            raise ValueError("PINECONE_API_KEY environment variable is not set.")
        
        if not self.pinecone_index_name:
            raise ValueError("PINECONE_INDEX_NAME environment variable is not set.")


class DocumentProcessor(ABC):
    """Abstract base class for document processors.
    
    This class defines the interface that all document processors must implement.
    It provides a consistent API for extracting text from different document types
    and creating Document objects with appropriate metadata.
    
    The abstract methods ensure that any concrete implementation provides both
    text extraction and document creation capabilities.
    """
    
    @abstractmethod
    def extract_text(self, file_path: str) -> str:
        """Extract text from a document.
        
        Abstract method that must be implemented by concrete processors.
        Each processor should handle its specific document type and return
        the extracted text content.
        
        Args:
            file_path (str): Absolute path to the document file
            
        Returns:
            str: Extracted text content from the document
            
        Raises:
            NotImplementedError: If not implemented by concrete class
            FileNotFoundError: If the file doesn't exist
            Exception: For document-specific processing errors
        """
        pass
    
    @abstractmethod
    def create_document(self, file_path: str, text: str) -> Document:
        """Create a Document object from text and file path.
        
        Abstract method for creating LangChain Document objects with
        appropriate metadata. The metadata should include information
        about the source file and processing details.
        
        Args:
            file_path (str): Path to the source document
            text (str): Extracted text content
            
        Returns:
            Document: LangChain Document object with text and metadata
            
        Raises:
            NotImplementedError: If not implemented by concrete class
        """
        pass


class PDFProcessor(DocumentProcessor):
    """Concrete implementation for processing PDF documents.
    
    This class implements the DocumentProcessor interface specifically for PDF files.
    It uses the pypdf library to extract text content from PDF documents and
    creates Document objects with comprehensive metadata.
    
    The processor handles multi-page PDFs by concatenating text from all pages
    and includes file system metadata in the resulting Document objects.
    """
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from a PDF document.
        
        Reads a PDF file and extracts text content from all pages.
        The text from multiple pages is concatenated with newline separators.
        
        Args:
            file_path (str): Absolute path to the PDF file
            
        Returns:
            str: Extracted and concatenated text from all PDF pages,
                 with leading/trailing whitespace removed
                 
        Raises:
            FileNotFoundError: If the PDF file doesn't exist at the specified path
            Exception: For PDF reading or text extraction errors
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file {file_path} does not exist.")
        
        text = ""
        pdf_reader = PdfReader(file_path)
        
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    
    def create_document(self, file_path: str, text: str) -> Document:
        """Create a Document object with metadata.
        
        Creates a LangChain Document object from extracted text and file metadata.
        The metadata includes source file information, creation timestamp,
        processing details, and file type identification.
        
        Args:
            file_path (str): Path to the source PDF file
            text (str): Extracted text content from the PDF
            
        Returns:
            Document: LangChain Document object containing the text content
                     and comprehensive metadata including:
                     - source: Original file path
                     - created_at: File creation timestamp
                     - created_by: Processing script identifier
                     - file_type: Document type (pdf)
        """
        return Document(
            page_content=text,
            metadata={
                "source": file_path,
                "created_at": os.path.getctime(file_path),
                "created_by": "Data Ingestion Script",
                "file_type": "pdf"
            }
        )


class EmbeddingService:
    """Service class for creating embeddings.
    
    This service manages the creation and configuration of OpenAI embeddings
    for document vectorization. It implements lazy initialization to avoid
    unnecessary API calls and provides a consistent interface for embedding
    generation across the pipeline.
    
    The service uses OpenAI's text-embedding-3-large model with 1024 dimensions
    for high-quality document embeddings suitable for semantic search.
    
    Attributes:
        config (Config): Configuration object containing API credentials
        _embeddings (OpenAIEmbeddings): Cached embeddings instance
    """
    
    def __init__(self, config: Config):
        """Initialize the embedding service with configuration.
        
        Args:
            config (Config): Configuration object containing OpenAI API key
                           and other necessary settings
        """
        self.config = config
        self._embeddings = None
    
    def get_embeddings(self) -> OpenAIEmbeddings:
        """Get or create OpenAI embeddings instance.
        
        Implements lazy initialization pattern - creates the embeddings instance
        only when first requested and caches it for subsequent calls. This
        approach optimizes performance and resource usage.
        
        Returns:
            OpenAIEmbeddings: Configured OpenAI embeddings instance using
                            text-embedding-3-large model with 1024 dimensions
                            
        Note:
            The embeddings are cached after first creation to avoid
            unnecessary reinitialization on repeated calls.
        """
        if self._embeddings is None:
            self._embeddings = OpenAIEmbeddings(
                model="text-embedding-3-large",
                dimensions=1024,
                openai_api_key=self.config.openai_api_key
            )
        return self._embeddings


class VectorStoreService:
    """Service class for vector store operations.
    
    This service handles all interactions with the Pinecone vector database,
    including document insertion and validation. It provides a clean interface
    for storing vectorized documents and manages the connection to Pinecone
    using the provided configuration.
    
    The service includes comprehensive input validation to ensure data integrity
    and proper error handling for robust operation in production environments.
    
    Attributes:
        config (Config): Configuration object containing Pinecone credentials
                        and index information
    """
    
    def __init__(self, config: Config):
        """Initialize the vector store service with configuration.
        
        Args:
            config (Config): Configuration object containing Pinecone API key,
                           index name, and other necessary settings
        """
        self.config = config
    
    def push_documents(self, documents: List[Document], embeddings: OpenAIEmbeddings, 
                      index_name: Optional[str] = None) -> None:
        """Push documents to Pinecone vector store.
        
        Validates inputs, creates a Pinecone vector store connection, and
        adds the provided documents to the specified index. The documents
        are automatically vectorized using the provided embeddings service.
        
        Args:
            documents (List[Document]): List of LangChain Document objects
                                      to be stored in the vector database
            embeddings (OpenAIEmbeddings): Configured embeddings service
                                         for document vectorization
            index_name (Optional[str]): Specific index name to use.
                                      If None, uses the index from config
                                      
        Raises:
            ValueError: If documents list is empty, embeddings is None,
                       or no valid index name is available
                       
        Note:
            The function prints a success message indicating the number
            of documents successfully stored in Pinecone.
        """
        self._validate_inputs(documents, embeddings, index_name)
        
        actual_index_name = index_name or self.config.pinecone_index_name
        
        vector_store = PineconeVectorStore(
            index_name=actual_index_name,
            embedding=embeddings,
            pinecone_api_key=self.config.pinecone_api_key,
        )
        
        vector_store.add_documents(documents)
        print(f"Successfully pushed {len(documents)} documents to Pinecone.")
    
    def _validate_inputs(self, documents: List[Document], embeddings: OpenAIEmbeddings, 
                        index_name: Optional[str]) -> None:
        """Validate input parameters.
        
        Performs comprehensive validation of all input parameters to ensure
        they meet the requirements for successful vector store operations.
        
        Args:
            documents (List[Document]): Documents list to validate
            embeddings (OpenAIEmbeddings): Embeddings service to validate
            index_name (Optional[str]): Index name to validate
            
        Raises:
            ValueError: If documents list is empty
            ValueError: If embeddings is None
            ValueError: If no valid index name is available (neither provided
                       nor configured in environment)
        """
        if not documents:
            raise ValueError("Documents list cannot be empty.")
        
        if embeddings is None:
            raise ValueError("Embeddings must be provided.")
        
        if not index_name and not self.config.pinecone_index_name:
            raise ValueError("Index name must be provided or set in environment variables.")


class DocumentIngestionPipeline:
    """Main pipeline class for document ingestion.
    
    This class orchestrates the entire document ingestion process, from reading
    files through processing and storing them in the vector database. It combines
    all the service components and provides high-level methods for different
    ingestion workflows.
    
    The pipeline supports both directory-based batch processing and individual
    file processing, with comprehensive error handling and progress reporting.
    It's designed to be flexible and extensible for different document types
    and processing requirements.
    
    Attributes:
        config (Config): Configuration object with all necessary settings
        processor (DocumentProcessor): Document processor for text extraction
        embedding_service (EmbeddingService): Service for creating embeddings
        vector_store_service (VectorStoreService): Service for vector operations
    """
    
    def __init__(self, config: Optional[Config] = None):
        """Initialize the document ingestion pipeline.
        
        Sets up all necessary services and components for document processing.
        Uses default configuration if none provided, and initializes with
        PDF processor as the default document handler.
        
        Args:
            config (Optional[Config]): Configuration object. If None, creates
                                     a new Config instance with default settings
        """
        self.config = config or Config()
        self.processor = PDFProcessor()
        self.embedding_service = EmbeddingService(self.config)
        self.vector_store_service = VectorStoreService(self.config)
    
    def process_documents(self, file_paths: List[str]) -> List[Document]:
        """Process a list of file paths into Document objects.
        
        Iterates through the provided file paths, extracts text from each file,
        and creates Document objects with metadata. Includes error handling
        for individual files to ensure that processing failures don't stop
        the entire batch.
        
        Args:
            file_paths (List[str]): List of absolute file paths to process
            
        Returns:
            List[Document]: List of successfully processed Document objects.
                          May be shorter than input list if some files failed
                          
        Note:
            Prints warnings for files that couldn't be processed and continues
            with remaining files. Errors are logged but don't halt processing.
        """
        documents = []
        
        for file_path in file_paths:
            try:
                text = self.processor.extract_text(file_path)
                
                if text:
                    document = self.processor.create_document(file_path, text)
                    documents.append(document)
                else:
                    print(f"Warning: No text extracted from {file_path}")
            
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                continue
        
        return documents
    
    def ingest_from_directory(self, directory_path: str, 
                            file_extension: str = ".pdf") -> None:
        """Ingest all files with specified extension from a directory.
        
        Scans the specified directory for files matching the given extension,
        processes them into Document objects, creates embeddings, and stores
        them in the vector database. This is the main method for batch processing
        of documents from a filesystem location.
        
        Args:
            directory_path (str): Absolute path to the directory containing files
            file_extension (str): File extension to filter by (default: ".pdf").
                                Must include the dot (e.g., ".pdf", ".txt")
                                
        Raises:
            FileNotFoundError: If the specified directory doesn't exist
            ValueError: If no files with the specified extension are found
                       or if no documents were successfully created
                       
        Note:
            Prints progress information including number of files found
            and completion status. All files are processed as a batch
            for efficient vector store operations.
        """
        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Directory {directory_path} does not exist.")
        
        files = os.listdir(directory_path)
        file_paths = [
            os.path.join(directory_path, file)
            for file in files if file.endswith(file_extension)
        ]
        
        if not file_paths:
            raise ValueError(f"No {file_extension} files found in {directory_path}.")
        
        print(f"Found {len(file_paths)} {file_extension} files in {directory_path}.")
        
        documents = self.process_documents(file_paths)
        
        if not documents:
            raise ValueError("No documents were created from the files.")
        
        embeddings = self.embedding_service.get_embeddings()
        self.vector_store_service.push_documents(documents, embeddings)
        
        print("Data ingestion completed successfully.")
    
    def ingest_files(self, file_paths: List[str]) -> None:
        """Ingest specific files.
        
        Processes a specific list of files rather than scanning a directory.
        Useful for selective processing or when files are located in different
        directories. Follows the same processing pipeline as directory ingestion.
        
        Args:
            file_paths (List[str]): List of absolute paths to files to process
            
        Raises:
            ValueError: If no documents were successfully created from the files
            
        Note:
            Each file in the list is processed individually, with error handling
            ensuring that failures in individual files don't stop the entire batch.
        """
        documents = self.process_documents(file_paths)
        
        if not documents:
            raise ValueError("No documents were created from the files.")
        
        embeddings = self.embedding_service.get_embeddings()
        self.vector_store_service.push_documents(documents, embeddings)
        
        print("Data ingestion completed successfully.")
    
    def set_processor(self, processor: DocumentProcessor) -> None:
        """Set a custom document processor.
        
        Allows swapping the document processor to handle different file types
        or processing requirements. The processor must implement the
        DocumentProcessor interface.
        
        Args:
            processor (DocumentProcessor): New processor instance that implements
                                         the DocumentProcessor abstract class
                                         
        Example:
            pipeline = DocumentIngestionPipeline()
            custom_processor = CustomTextProcessor()
            pipeline.set_processor(custom_processor)
        """
        self.processor = processor
    
    def get_statistics(self) -> dict:
        """Get statistics about the current configuration.
        
        Returns a dictionary containing information about the current pipeline
        configuration, including embedding model details, vector store settings,
        and processor type. Useful for debugging and monitoring.
        
        Returns:
            dict: Configuration statistics containing:
                - embedding_model: Name of the embedding model in use
                - embedding_dimensions: Dimensionality of the embeddings
                - vector_store: Type of vector store being used
                - index_name: Name of the vector store index
                - processor_type: Class name of the current document processor
        """
        return {
            "embedding_model": "text-embedding-3-large",
            "embedding_dimensions": 1024,
            "vector_store": "Pinecone",
            "index_name": self.config.pinecone_index_name,
            "processor_type": type(self.processor).__name__
        }
    
    @staticmethod
    def example_usage():
        """Example usage demonstrating different ways to use the modularized pipeline.
        
        This function provides comprehensive examples of how to use the various
        components of the document ingestion pipeline. It demonstrates different
        usage patterns including basic usage, custom configuration, selective
        processing, and individual service usage.
        
        The examples are commented out to prevent execution during normal runs
        but serve as documentation and reference for developers.
        
        Examples covered:
        1. Basic pipeline usage with default configuration
        2. Processing specific files rather than entire directories
        3. Custom configuration setup
        4. Processing documents without immediate storage
        5. Using individual services independently
        
        Note:
            This is a static method meant for demonstration purposes.
            Most examples are commented out to prevent unintended execution.
        """
        # Example 1: Basic usage with default configuration
        pipeline = DocumentIngestionPipeline()
        
        # Example 2: Process specific files
        specific_files = [
            "../lc-training-data/rag-docs/python-developer-resume-example.pdf",
            "../lc-training-data/rag-docs/software-engineer-iii-front-end-resume-example.pdf"
        ]
        # pipeline.ingest_files(specific_files)
        
        # Example 3: Custom configuration
        custom_config = Config()
        custom_pipeline = DocumentIngestionPipeline(custom_config)
        
        # Example 4: Process documents without immediately storing them
        documents = pipeline.process_documents(specific_files)
        print(f"Processed {len(documents)} documents")
        
        # Example 5: Use individual services
        embedding_service = EmbeddingService(custom_config)
        vector_store_service = VectorStoreService(custom_config)
        
        embeddings = embedding_service.get_embeddings()
        # vector_store_service.push_documents(documents, embeddings)


if __name__ == "__main__":
    try:
        # Initialize the ingestion pipeline
        pipeline = DocumentIngestionPipeline()
        
        # Define the directory path for PDF files
        directory_path = "../../sony-blr-agentic-ai-practices/lc-training-data/rag-docs"
        
        # Ingest all PDF files from the directory
        pipeline.ingest_from_directory(directory_path, ".pdf")
        
        # Example usage of the modularized pipeline
        # DocumentIngestionPipeline.example_usage()
        
    except FileNotFoundError as e:
        print(f"File/Directory Error: {e}")
    except ValueError as e:
        print(f"Value Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

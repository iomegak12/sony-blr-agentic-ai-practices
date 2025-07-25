from e2e_lg_rag.data.loader import load_data, setup_vectorstore
from e2e_lg_rag.components.graders import create_retrieval_grader, create_hallucination_grader, create_answer_grader
from e2e_lg_rag.components.transformers import create_question_rewriter
from e2e_lg_rag.components.generator import create_rag_chain
from e2e_lg_rag.workflows.rag_workflow import create_workflow_graph
from e2e_lg_rag.utils.env_setup import load_environment
from e2e_lg_rag.utils.logging_config import get_logger
from pprint import pprint

logger = get_logger("self_rag")

class SelfRAG:
    """
    Self-RAG system using LangGraph for RAG with self-reflection capabilities
    """
    def __init__(self, urls=None):
        """
        Initialize the Self-RAG system
        """
        logger.info("Initializing Self-RAG system")
        
        try:
            # Load environment variables
            logger.debug("Loading environment variables")
            self.model_name, self.ollama_base_url = load_environment()
            logger.info(f"Using model: {self.model_name}, Ollama URL: {self.ollama_base_url}")
            
            # Set up data sources - always call this to ensure retriever exists
            logger.info("Setting up data sources")
            self.setup_data_sources(urls)
            
            # Initialize components
            logger.debug("Setting up RAG components")
            self.setup_components()
            
            # Initialize workflow
            logger.debug("Setting up workflow graph")
            self.setup_workflow()
            
            logger.info("Self-RAG system initialized successfully")
            
        except Exception as e:
            logger.exception(f"Failed to initialize Self-RAG system: {str(e)}")
            raise
    
    def setup_data_sources(self, urls):
        """
        Set up data sources from URLs
        """
        try:
            # Default URLs if none provided or empty list
            if not urls:
                urls = [
                    "https://lilianweng.github.io/posts/2023-06-23-agent/",
                    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
                    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
                ]
                logger.info("No URLs provided, using default URLs")
            else:
                logger.info(f"Setting up data sources from {len(urls)} provided URLs")
            
            logger.debug(f"URLs: {urls}")
            
            # Load and process documents
            logger.info("Loading and processing documents")
            doc_splits = load_data(urls)
            logger.info(f"Processed {len(doc_splits)} document chunks")
            
            # Set up vector store and retriever
            logger.info("Setting up vector store and retriever")
            self.vectorstore, self.retriever = setup_vectorstore(doc_splits)
            logger.info("Vector store and retriever set up successfully")
            
        except Exception as e:
            logger.exception(f"Failed to set up data sources: {str(e)}")
            raise
    
    def setup_components(self):
        """
        Set up all components for the Self-RAG system
        """
        try:
            logger.info("Setting up Self-RAG components")
            
            # Create graders
            logger.debug("Creating retrieval grader")
            self.retrieval_grader = create_retrieval_grader(
                self.model_name, self.ollama_base_url
            )
            
            logger.debug("Creating hallucination grader")
            self.hallucination_grader = create_hallucination_grader(
                self.model_name, self.ollama_base_url
            )
            
            logger.debug("Creating answer grader")
            self.answer_grader = create_answer_grader(
                self.model_name, self.ollama_base_url
            )
            
            # Create question rewriter
            logger.debug("Creating question rewriter")
            self.question_rewriter = create_question_rewriter(
                self.model_name, self.ollama_base_url
            )
            
            # Create RAG chain
            logger.debug("Creating RAG chain")
            self.rag_chain = create_rag_chain(
                self.model_name, self.ollama_base_url
            )
            
            logger.info("All components set up successfully")
            
        except Exception as e:
            logger.exception(f"Failed to set up components: {str(e)}")
            raise
    
    def setup_workflow(self):
        """
        Set up the workflow graph
        """
        try:
            logger.info("Setting up workflow graph")
            
            # Safety check - ensure all required components exist
            required_attrs = ['retriever', 'rag_chain', 'retrieval_grader', 
                            'hallucination_grader', 'answer_grader', 'question_rewriter']
            missing_attrs = [attr for attr in required_attrs if not hasattr(self, attr)]
            
            if missing_attrs:
                raise AttributeError(f"Missing required attributes: {missing_attrs}")
            
            self.app = create_workflow_graph(
                self.retriever,
                self.rag_chain,
                self.retrieval_grader,
                self.hallucination_grader,
                self.answer_grader,
                self.question_rewriter
            )
            logger.info("Workflow graph set up successfully")
            
        except Exception as e:
            logger.exception(f"Failed to set up workflow: {str(e)}")
            raise
    
    def run(self, question):
        """
        Run the Self-RAG system on a question
        """
        try:
            logger.info(f"Running Self-RAG inference for question: '{question[:100]}{'...' if len(question) > 100 else ''}'")
            
            inputs = {"question": question}
            final_state = None
            
            logger.debug("Starting workflow execution")
            for output in self.app.stream(inputs):
                for key, value in output.items():
                    # Node
                    logger.debug(f"Workflow node '{key}' executed")
                    pprint(f"Node '{key}':")
                pprint("\n---\n")
                final_state = value
            
            # Return the final generation
            result = final_state.get("generation", "No answer generated")
            logger.info(f"Self-RAG inference completed successfully. Answer length: {len(result)} characters")
            logger.debug(f"Generated answer: {result[:200]}{'...' if len(result) > 200 else ''}")
            
            return result
            
        except Exception as e:
            logger.exception(f"Failed to run Self-RAG inference: {str(e)}")
            raise

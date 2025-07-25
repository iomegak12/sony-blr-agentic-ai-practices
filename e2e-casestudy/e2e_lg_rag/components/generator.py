from langchain import hub
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser

def create_rag_chain(model, base_url, temperature=0):
    """
    Create a RAG chain for generating answers
    """
    # Prompt
    prompt = hub.pull("rlm/rag-prompt")
    
    # LLM
    llm = ChatOllama(model=model, base_url=base_url, temperature=temperature)
    
    # Chain
    rag_chain = prompt | llm | StrOutputParser()
    
    return rag_chain

def format_docs(docs):
    """
    Format a list of documents into a single string
    """
    return "\n\n".join(doc.page_content for doc in docs)

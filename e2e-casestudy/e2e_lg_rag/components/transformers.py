from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser

def create_question_rewriter(model, base_url, temperature=0):
    """
    Create a component that rewrites questions for better retrieval
    """
    llm = ChatOllama(model=model, base_url=base_url, temperature=temperature)
    
    system = """You a question re-writer that converts an input question to a better version that is optimized \n 
         for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning."""
    
    re_write_prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "Here is the initial question: \n\n {question} \n Formulate an improved question."),
    ])
    
    return re_write_prompt | llm | StrOutputParser()

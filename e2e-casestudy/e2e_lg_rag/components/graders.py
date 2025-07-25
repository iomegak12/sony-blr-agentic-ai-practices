from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from e2e_lg_rag.models.schema import GradeDocuments, GradeHallucinations, GradeAnswer

def create_retrieval_grader(model, base_url, temperature=0):
    """
    Create a grader for evaluating document relevance
    """
    llm = ChatOllama(model=model, base_url=base_url, temperature=temperature)
    structured_llm_grader = llm.with_structured_output(GradeDocuments)
    
    system = """You are a grader assessing relevance of a retrieved document to a user question. \n 
        It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
        If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n
        Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
    
    grade_prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ])
    
    return grade_prompt | structured_llm_grader

def create_hallucination_grader(model, base_url, temperature=0):
    """
    Create a grader for evaluating hallucinations in generation
    """
    llm = ChatOllama(model=model, base_url=base_url, temperature=temperature)
    structured_llm_grader = llm.with_structured_output(GradeHallucinations)
    
    system = """You are a grader assessing whether an LLM generation is grounded in / supported by a set of retrieved facts. \n 
         Give a binary score 'yes' or 'no'. 'Yes' means that the answer is grounded in / supported by the set of facts."""
    
    hallucination_prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"),
    ])
    
    return hallucination_prompt | structured_llm_grader

def create_answer_grader(model, base_url, temperature=0):
    """
    Create a grader for evaluating if the answer addresses the question
    """
    llm = ChatOllama(model=model, base_url=base_url, temperature=temperature)
    structured_llm_grader = llm.with_structured_output(GradeAnswer)
    
    system = """You are a grader assessing whether an answer addresses / resolves a question \n 
         Give a binary score 'yes' or 'no'. Yes' means that the answer resolves the question."""
    
    answer_prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "User question: \n\n {question} \n\n LLM generation: {generation}"),
    ])
    
    return answer_prompt | structured_llm_grader

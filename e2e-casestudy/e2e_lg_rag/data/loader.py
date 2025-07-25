from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

def load_data(urls):
    """
    Load and process documents from URLs
    """
    docs = [WebBaseLoader(url).load() for url in urls]
    docs_list = [item for sublist in docs for item in sublist]

    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=250, chunk_overlap=0
    )
    doc_splits = text_splitter.split_documents(docs_list)
    
    return doc_splits

def setup_vectorstore(documents, collection_name="rag-chroma"):
    """
    Create and return a vector store and retriever
    """
    vectorstore = Chroma.from_documents(
        documents=documents,
        collection_name=collection_name,
        embedding=OpenAIEmbeddings(),
    )
    
    retriever = vectorstore.as_retriever()
    return vectorstore, retriever

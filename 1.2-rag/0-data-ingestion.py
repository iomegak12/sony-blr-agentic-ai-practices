import os

from dotenv import load_dotenv
from pypdf import PdfReader

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.schema import Document
from langchain_pinecone import PineconeVectorStore

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

pinecone_api_key = os.getenv("PINECONE_API_KEY")

if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY environment variable is not set.")


def get_pdf_text(pdf_document):
    text = ""
    pdf_reader = PdfReader(pdf_document)

    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"

    return text.strip()


def create_documents(pdf_files):
    documents = []

    for pdf_file in pdf_files:
        if not os.path.exists(pdf_file):
            raise FileNotFoundError(f"PDF file {pdf_file} does not exist.")

        text = get_pdf_text(pdf_file)

        if text:
            documents.append(
                Document(page_content=text,
                         metadata={"source": pdf_file}))
        else:
            print(f"Warning: No text extracted from {pdf_file}")

    return documents


def create_embeddings():
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        openai_api_key=openai_api_key)

    return embeddings


def push_documents_to_pinecone(documents, embeddings, index_name):

    validation = index_name is not None and \
        embeddings is not None and \
        documents is not None

    if not validation:
        raise ValueError(
            "Index name, embeddings, and documents must be provided.")

    vector_store = PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings,
        pinecone_api_key=pinecone_api_key,
    )

    vector_store.add_documents(documents)

    print(f"Successfully pushed {len(documents)} documents to Pinecone.")


if __name__ == "__main__":
    index_name = os.environ.get("PINECONE_INDEX_NAME")

    if not index_name:
        raise ValueError(
            "PINECONE_INDEX_NAME environment variable is not set.")

    directory_path = "./Docs"
    files = os.listdir(directory_path)
    pdf_fils = [
        os.path.join(directory_path, file)
        for file in files if file.endswith(".pdf")
    ]

    print(f"Found {len(pdf_fils)} PDF files in {directory_path}.")

    documents = create_documents(pdf_fils)
    embeddings = create_embeddings()
    push_documents_to_pinecone(documents, embeddings, index_name)

    print("Data ingestion completed successfully.")

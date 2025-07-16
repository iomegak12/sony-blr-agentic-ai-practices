import os

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

pinecone_api_key = os.getenv("PINECONE_API_KEY")

if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY environment variable is not set.")

pinecone_index_name = os.getenv("PINECONE_INDEX_NAME")

if not pinecone_index_name:
    raise ValueError("PINECONE_INDEX_NAME environment variable is not set.")


def create_embeddings():
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        dimensions=1024,
        openai_api_key=openai_api_key
    )

    return embeddings


def search_similar_documents(query, no_of_results=3, index_name=None, embeddings=None):
    if query is None or query.strip() == "":
        raise ValueError("Query must be a non-empty string.")

    if index_name is None:
        index_name = pinecone_index_name

    if embeddings is None:
        embeddings = create_embeddings()

    vector_store = PineconeVectorStore(
        index_name=pinecone_index_name,
        embedding=embeddings
    )

    results = vector_store.similarity_search_with_score(query, k=no_of_results)

    return results


if __name__ == "__main__":
    query = """
        Experienced Candidate with Embedded Systems and Firmware Development Skills
        Requirements:
        Bachelor's degree in Computer Science
        At least 5 years of experience in embedded systems and firmware development
        Understanding of Computer Architecture, User Interfacing Technologies and Programming Languages
    """

    embeddings = create_embeddings()
    no_of_results = 3

    results = search_similar_documents(
        query, no_of_results, pinecone_index_name, embeddings)

    print(f"Query: {query}")
    print(f"Number of results: {len(results)}")

    for i, (doc, score) in enumerate(results):
        print(f"Result {i + 1}:")
        print(f"Score: {score}")
        # Print first 200 characters
        print(f"Document content: {doc.page_content[:200]}...")
        print(f"Source: {doc.metadata.get('source', 'Unknown')}")
        print("=" * 40)

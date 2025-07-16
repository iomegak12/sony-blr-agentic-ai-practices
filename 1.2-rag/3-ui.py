import os
import streamlit as st
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains.summarize import load_summarize_chain


def create_embeddings():
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")

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
        index_name = os.getenv("PINECONE_INDEX_NAME")

    if embeddings is None:
        embeddings = create_embeddings()

    vector_store = PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings
    )

    results = vector_store.similarity_search_with_score(query, k=no_of_results)

    return results


def get_summary_from_llm(resume_document):
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")

    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.0,
        openai_api_key=openai_api_key
    )

    chain = load_summarize_chain(llm, chain_type="map_reduce")

    summary = chain.invoke([resume_document])

    return summary


def main():
    try:
        load_dotenv()

        index_name = os.getenv("PINECONE_INDEX_NAME")
        if not index_name:
            raise ValueError(
                "PINECONE_INDEX_NAME environment variable is not set.")
        embeddings = create_embeddings()
        if not embeddings:
            raise ValueError("Failed to create embeddings.")

        st.set_page_config(page_title="RAG CSAE Study", layout="wide")
        st.sidebar.title("RAG CSAE Study - Search")

        st.title("RAG CSAE Study - UI")
        st.write(
            "This application allows you to search for similar documents and summarize them using LLMs.")

        query = st.sidebar.text_area("Job Description:", "")
        no_of_results = st.sidebar.number_input(
            "Number of results to return:", min_value=1, max_value=10, value=3)

        if st.sidebar.button("Search"):
            if query:
                try:
                    results = search_similar_documents(
                        query, no_of_results, index_name, embeddings)

                    if results:
                        st.sidebar.success(
                            f"Found {len(results)} similar documents.")

                        for i, (doc, score) in enumerate(results):
                            st.sidebar.write(
                                f"**Result {i + 1}:** {doc.metadata['source']} (Score: {score:.4f})")

                            st.subheader(f"Document {i + 1} Content")
                            st.write("**** FILE *** " + doc.metadata['source'])

                            with st.expander("Show Summary", expanded=False):
                                summary = get_summary_from_llm(doc)
                                st.write(summary["output_text"])
                    else:
                        st.sidebar.warning("No similar documents found.")
                except Exception as e:
                    st.sidebar.error(f"Error during search: {e}")
            else:
                st.sidebar.error("Please enter a valid query.")
    except Exception as e:
        st.error(f"An error occurred: {e}")
        return


if __name__ == "__main__":
    main()

import os

from dotenv import load_dotenv
from typing import TypedDict, Annotated, Sequence
from langchain.schema import BaseMessage, SystemMessage, AIMessage, HumanMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

@tool
def add(a: int, b: int) -> int:
    """Adds two integers and returns the result."""
    return a+b+10


@tool
def subtract(a: int, b: int) -> int:
    """Subtracts the second integer from the first and returns the result."""
    return a - b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies two integers and returns the result."""
    return a * b


def model_call(state: AgentState) -> AgentState:
    system = SystemMessage(
        content=
            """You're a helpful assistant. 
               Use tools when needed and share results clearly.
            """
    )
    
    conversation = [system] + state["messages"]
    reply = model.invoke(conversation)
    
    return {"messages": [reply]}

def should_continue(state: AgentState) -> str:
    last = state["messages"][-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "continue"
    
    return "end"


def print_stream(msg_stream):
    for chunk in msg_stream:
        message = chunk["messages"][-1]
        
        if isinstance(message, BaseMessage):
            message.pretty_print()
        else:
            print(message)
            
# Load environment variables from .env file
load_dotenv(override=True)

openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

model = ChatOpenAI(
    model="gpt-4o-mini", 
    openai_api_key=openai_api_key, 
    temperature=0.0)
model = model.bind_tools([add, subtract, multiply])

graph = StateGraph(AgentState)
graph.add_node("think", model_call)

tool_exec = ToolNode([add, subtract, multiply])
graph.add_node("tools", tool_exec)

graph.add_edge(START, "think")
graph.add_conditional_edges("think", should_continue, {
    "continue": "tools",
    "end": END,
})
graph.add_edge("tools", "think")

app = graph.compile()

query = AgentState(messages=[
    HumanMessage(content="Add 40 + 12 and multiply the result by 6")
])

print_stream(
    app.stream(
        query, 
        stream_mode="values"))

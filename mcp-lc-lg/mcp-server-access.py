# Create server parameters for stdio connection
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.client import MultiServerMCPClient
import asyncio
from dotenv import load_dotenv
import os
# For running asyncio
load_dotenv()
# model for agent
model = ChatOpenAI(model="gpt-4o")

# server parameters
server_params = {
    "math": {
        "command": "python",
        # Make sure to update to the full absolute path to your math_server.py file
        "args": ["C:\\000 - SONY Agentic AI\\demonstrations\\mcp-lc-lg\\math_server.py"],
        "transport": "stdio",
    },
    "weather": {
        "command": "python",
        # Make sure to update to the full absolute path to your weather_server.py file
        "args": ["C:\\000 - SONY Agentic AI\\demonstrations\\mcp-lc-lg\\weather_server.py"],
        "transport": "stdio",
    },
    "counter": {
        "transport": "sse",
        "url": "https://35acc4f7277e.ngrok-free.app/sse"
    },
    "remote-file-system": {
        "transport": "sse",
        "url": "http://localhost:8004/sse"
    }
}

# print(server_params)


async def main(query: str):
    client = MultiServerMCPClient(server_params)
    tools = await client.get_tools()
    agent = create_react_agent(model, tools)
    response = await agent.ainvoke({"messages": query})

    return response

# Run the async main function - queries for testing
# query = "what is the weather in st. louis, MO now?"
# query = "A factory produces 250 gadgets per day. If production increases by 20 gadgets each day for 5 days, how many gadgets will the factory produce in total over those 5 days?"
# query = "What is (3+5) * 4 - 13"
# query = "how many r characters found in the word 'characteristic'?"

query = "what is the weather in st. louis, MO now and write the output to the file named /weather.txt in the remote file system?"

if __name__ == "__main__":
    response = asyncio.run(main(query))
    print('------------')
    print(response)

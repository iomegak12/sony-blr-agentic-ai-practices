from mcp.server.fastmcp import FastMCP

import time
import signal
import sys


def signal_handler(sig, frame):
    print("Shutting down server gracefully...")
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)

mcp = FastMCP(
    name="count-r",
    timeout=30
)


@mcp.tool()
def count_r(word: str) -> int:
    """Count the number of 'r' letters in a given word."""
    try:
        if not isinstance(word, str):
            return 0
        return word.lower().count("r")
    except Exception as e:
        # Return 0 on any error
        return 0


if __name__ == "__main__":
    try:
        print("Starting MCP server 'count-r' ...")

        mcp.run(transport="stdio")
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(5)

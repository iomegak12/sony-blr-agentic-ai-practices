#!/usr/bin/env python3
"""
Demo script to start the Self-RAG API with web interface
"""
import os
import sys
import time
import webbrowser
from pathlib import Path

def main():
    print("🚀 Self-RAG API with Web Interface")
    print("=" * 50)
    
    # Check if we're in the right directory
    current_dir = Path.cwd()
    api_file = current_dir / "e2e_lg_rag" / "api.py"
    public_dir = current_dir / "public"
    
    if not api_file.exists():
        print("❌ Error: e2e_lg_rag/api.py not found")
        print("Please run this script from the project root directory")
        return 1
    
    if not public_dir.exists():
        print("❌ Error: public directory not found")
        print("Please ensure the web interface files are in the public/ directory")
        return 1
    
    print("✅ API file found")
    print("✅ Web interface files found")
    print()
    
    print("📁 Web Interface Structure:")
    for file_path in sorted(public_dir.rglob("*")):
        if file_path.is_file():
            relative_path = file_path.relative_to(current_dir)
            print(f"   {relative_path}")
    print()
    
    print("🌐 Starting server...")
    print("   URL: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print("   Web Interface: http://localhost:8000")
    print()
    print("📝 Available endpoints:")
    print("   GET  /           - Web interface")
    print("   GET  /health     - Health check")
    print("   POST /generate   - Generate answers")
    print("   GET  /docs       - API documentation")
    print()
    
    # Wait a moment then try to open browser
    print("⏱️  Opening browser in 3 seconds...")
    time.sleep(3)
    
    try:
        webbrowser.open("http://localhost:8000")
        print("🌐 Browser opened to web interface")
    except Exception as e:
        print(f"⚠️  Could not open browser automatically: {e}")
        print("Please manually navigate to: http://localhost:8000")
    
    print()
    print("🔧 To test the interface, run:")
    print("   python test_web_interface.py")
    print()
    print("⚡ Starting server with uvicorn...")
    print("   (Press Ctrl+C to stop)")
    print("=" * 50)
    
    # Import and run the server
    try:
        import uvicorn
        uvicorn.run(
            "e2e_lg_rag.api:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        return 0
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

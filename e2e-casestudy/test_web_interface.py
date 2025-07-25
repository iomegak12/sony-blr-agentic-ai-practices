"""
Test script to verify the Self-RAG API with web interface
"""
import requests
import time
import sys

API_BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Status: {data.get('status')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_frontend():
    """Test the frontend is being served"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        if response.status_code == 200 and "Self-RAG API" in response.text:
            print("✅ Frontend is being served correctly")
            return True
        else:
            print(f"❌ Frontend test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend error: {e}")
        return False

def test_static_files():
    """Test that static files are accessible"""
    static_files = [
        "/static/css/styles.css",
        "/static/js/app.js"
    ]
    
    all_passed = True
    for file_path in static_files:
        try:
            response = requests.get(f"{API_BASE_URL}{file_path}", timeout=10)
            if response.status_code == 200:
                print(f"✅ Static file accessible: {file_path}")
            else:
                print(f"❌ Static file failed: {file_path} ({response.status_code})")
                all_passed = False
        except requests.exceptions.RequestException as e:
            print(f"❌ Static file error: {file_path} - {e}")
            all_passed = False
    
    return all_passed

def test_generate_endpoint():
    """Test the generate endpoint with a simple question"""
    try:
        payload = {
            "question": "What is the purpose of this API?"
        }
        response = requests.post(f"{API_BASE_URL}/generate", json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Generate endpoint working")
            print(f"   Response: {data.get('answer', '')[:100]}...")
            print(f"   Execution time: {data.get('execution_time', 0):.2f}s")
            return True
        else:
            print(f"❌ Generate endpoint failed: {response.status_code}")
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Generate endpoint error: {e}")
        return False

def main():
    print("🧪 Testing Self-RAG API with Web Interface")
    print("=" * 50)
    
    print("\n1. Testing Health Endpoint...")
    health_ok = test_health_endpoint()
    
    print("\n2. Testing Frontend...")
    frontend_ok = test_frontend()
    
    print("\n3. Testing Static Files...")
    static_ok = test_static_files()
    
    print("\n4. Testing Generate Endpoint...")
    generate_ok = test_generate_endpoint()
    
    print("\n" + "=" * 50)
    print("🏁 Test Results Summary:")
    print(f"   Health Endpoint: {'✅' if health_ok else '❌'}")
    print(f"   Frontend: {'✅' if frontend_ok else '❌'}")
    print(f"   Static Files: {'✅' if static_ok else '❌'}")
    print(f"   Generate Endpoint: {'✅' if generate_ok else '❌'}")
    
    if all([health_ok, frontend_ok, static_ok]):
        print("\n🎉 Web interface is ready! Visit http://localhost:8000")
        if generate_ok:
            print("🚀 Full API functionality confirmed!")
        else:
            print("⚠️  API functionality needs attention (but web interface works)")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the server setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

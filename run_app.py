#!/usr/bin/env python3
import subprocess
import threading
import os
import signal
import sys
import importlib.util

# Import config if available, otherwise use defaults
try:
    import config
    FASTAPI_HOST = getattr(config, 'FASTAPI_HOST', '0.0.0.0')
    FASTAPI_PORT = getattr(config, 'FASTAPI_PORT', 8000)
    REACT_DEV_PORT = getattr(config, 'REACT_DEV_PORT', 3000)
except ImportError:
    FASTAPI_HOST = '0.0.0.0'
    FASTAPI_PORT = 8000
    REACT_DEV_PORT = 3000

def run_fastapi():
    """Run the FastAPI backend"""
    print("Starting FastAPI server...")
    fastapi_process = subprocess.Popen([
        "python3", "-m", "uvicorn", "api:app", 
        "--reload", 
        "--host", FASTAPI_HOST, 
        "--port", str(FASTAPI_PORT)
    ], cwd="./server")
    return fastapi_process

def run_frontend():
    """Run the React frontend"""
    print("Starting React frontend...")
    # Set environment variable for the API URL
    env = os.environ.copy()
    env["VITE_API_BASE_URL"] = f"http://{FASTAPI_HOST}:{FASTAPI_PORT}"
    
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"], 
        cwd="./client",
        env=env
    )
    return frontend_process

def main():
    """Run both services and handle graceful shutdown"""
    # Start both services
    fastapi_process = run_fastapi()
    frontend_process = run_frontend()
    
    print("\n----------------------------------")
    print("Job Tracking System is running!")
    print(f"FastAPI server: http://{FASTAPI_HOST}:{FASTAPI_PORT}")
    print(f"React frontend: http://localhost:{REACT_DEV_PORT}")
    print("----------------------------------")
    print("Press Ctrl+C to stop all services")
    
    # Handle graceful shutdown
    try:
        # Wait for both processes
        fastapi_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down services...")
        # Terminate processes gracefully
        fastapi_process.terminate()
        frontend_process.terminate()
        
        fastapi_process.wait()
        frontend_process.wait()
        
        print("All services stopped.")
    
if __name__ == "__main__":
    main()
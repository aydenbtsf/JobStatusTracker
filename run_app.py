#!/usr/bin/env python3
import subprocess
import threading
import os
import signal
import sys

def run_fastapi():
    """Run the FastAPI backend"""
    print("Starting FastAPI server...")
    fastapi_process = subprocess.Popen(["python3", "-m", "uvicorn", "api:app", "--reload", "--host", "0.0.0.0", "--port", "8000"], 
                                      cwd="./server")
    return fastapi_process

def run_frontend():
    """Run the React frontend"""
    print("Starting React frontend...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"], 
                                       cwd="./client")
    return frontend_process

def main():
    """Run both services and handle graceful shutdown"""
    # Start both services
    fastapi_process = run_fastapi()
    frontend_process = run_frontend()
    
    print("\n----------------------------------")
    print("Job Tracking System is running!")
    print("FastAPI server: http://localhost:8000")
    print("React frontend: http://localhost:3000")
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
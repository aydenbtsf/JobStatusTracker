#!/bin/bash

# Start the FastAPI backend server
echo "Starting FastAPI backend server..."
python -m uvicorn server.api:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start the React frontend
echo "Starting React frontend..."
cd client && npm run dev

# Function to handle termination
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

wait
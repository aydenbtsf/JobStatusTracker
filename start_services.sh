#!/bin/bash

# Start the FastAPI backend server
echo "Starting FastAPI backend server..."
python -m uvicorn server.api:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start the React frontend server
echo "Starting React frontend with Vite..."
cd client && npm run dev &
FRONTEND_PID=$!

# Function to handle the termination signal
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Both services are running!"
echo "FastAPI backend: http://localhost:8000"
echo "React frontend: http://localhost:3000"
echo "Press Ctrl+C to shut down both services."

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID
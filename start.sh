#!/bin/bash

# Start the FastAPI backend server
echo "Starting FastAPI backend server..."
sh ./start_fastapi.sh &
BACKEND_PID=$!

# Start the React frontend
echo "Starting React frontend..."
cd client && npm run dev &
FRONTEND_PID=$!

# Function to handle termination
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID
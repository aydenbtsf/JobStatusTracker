#!/bin/bash

# Start FastAPI backend
./start_backend.sh &
BACKEND_PID=$!

# Start React frontend (this will block until terminated)
./start_frontend.sh

# When frontend terminates, clean up backend
kill $BACKEND_PID 2>/dev/null
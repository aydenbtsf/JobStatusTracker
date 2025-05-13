#!/bin/bash

echo "Starting FastAPI backend server..."
cd server
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000 
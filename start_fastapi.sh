#!/usr/bin/env bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if virtual environment exists, create if it doesn't
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$SCRIPT_DIR/venv"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$SCRIPT_DIR/venv/bin/activate"

# Install requirements
echo "Installing requirements..."
pip install -r "$SCRIPT_DIR/server/requirements.txt"

# Start the server using the full path to uvicorn
echo "Starting FastAPI server..."
"$uvicorn" server.main:app --reload --host 0.0.0.0 --port 8000 
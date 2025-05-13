#!/bin/bash

# Create virtual environment if it doesn't exist
python3 -m venv venv

# Activate virtual environment
. venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

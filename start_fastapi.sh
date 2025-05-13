#!/bin/bash
cd server
python3 -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
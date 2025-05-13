#!/bin/bash

echo "Starting React frontend..."
cd client
VITE_API_BASE_URL="http://localhost:8000" npm run dev
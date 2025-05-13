"""
Configuration settings for the Job Tracking System
"""

# FastAPI backend settings
FASTAPI_HOST = "0.0.0.0"  # Set to 0.0.0.0 to allow external connections
FASTAPI_PORT = 8000

# React frontend settings
REACT_DEV_PORT = 3000

# Database settings (if using a database in the future)
DATABASE_URL = None  # Currently using in-memory storage

# API settings
ENABLE_CORS = True
ALLOW_ORIGINS = ["*"]  # Allow all origins in development
ENABLE_AUTHENTICATION = False  # Authentication not implemented yet
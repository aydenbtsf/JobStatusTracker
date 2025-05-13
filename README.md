# Job Tracking System

A comprehensive job tracking system with a React frontend and FastAPI backend to monitor various forecast jobs through their lifecycle.

## Overview

This application allows you to:
- Track and monitor jobs with different statuses (pending, processing, completed, failed)
- Filter jobs by type, status, and date
- View detailed information about each job
- Create new jobs with specific parameters
- Retry failed jobs

## System Architecture

The application is built with two independent components:

1. **FastAPI Backend** - Handles data storage and processing logic
   - REST API endpoints for job management
   - In-memory database for job storage
   - Validation using Pydantic models

2. **React Frontend** - Provides the user interface
   - Modern UI components with shadcn/ui
   - Responsive design for all device sizes
   - State management with React Query

## Running the Application

### Option 1: Run both services together

Use the provided Python script to run both the frontend and backend:

```bash
python3 run_app.py
```

This will start:
- FastAPI server on http://localhost:8000
- React frontend on http://localhost:3000

### Option 2: Run services separately

#### Backend (FastAPI):

```bash
cd server
python3 -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (React):

```bash
cd client
npm run dev
```

## API Endpoints

- `GET /api/jobs` - Get all jobs (supports filtering)
- `GET /api/jobs/{job_id}` - Get a specific job
- `POST /api/jobs` - Create a new job
- `POST /api/jobs/{job_id}/retry` - Retry a failed job
- `DELETE /api/jobs/{job_id}` - Delete a job

## Project Structure

- `/client` - React frontend code
  - `/src/components` - UI components
  - `/src/pages` - Application pages
  - `/src/lib` - Shared utilities and types
- `/server` - FastAPI backend code
  - `api.py` - API endpoints
  - `models.py` - Data models
- `/shared` - Shared TypeScript schema definitions

## Job Types

The system supports multiple job types:
- `fetchTerrain` - For terrain data acquisition jobs
- `weatherForecast` - For weather prediction jobs
- `tideForecast` - For tide level prediction jobs
- `waveForecast` - For wave height/direction prediction jobs

Each job type has specific parameters and may produce different output data.
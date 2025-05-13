# Job Tracking System - FastAPI Backend

This is the backend component of the Job Tracking System, built with FastAPI.

## Getting Started

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:

```bash
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /api/jobs` - Get all jobs (supports filtering)
- `GET /api/jobs/{job_id}` - Get a specific job
- `POST /api/jobs` - Create a new job
- `POST /api/jobs/{job_id}/retry` - Retry a failed job
- `DELETE /api/jobs/{job_id}` - Delete a job

## Data Models

The main data models are defined in `models.py`:

- `Job` - The main job entity
- `JobType` - Enum of job types (fetchTerrain, weatherForecast, etc.)
- `JobStatus` - Enum of job statuses (pending, processing, completed, failed)
- `WaveForecastData` - Wave forecast data structure
- `CreateJobPayload` - Model for creating new jobs
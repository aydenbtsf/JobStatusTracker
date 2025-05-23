import os
import json
import uuid
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import uvicorn

from server.models import (
    Job, JobType, JobStatus, PipelineStatus, Pipeline,
    WaveForecastEntry, WaveForecastData, 
    CreateJobPayload, CreatePipelinePayload
)

app = FastAPI(title="Job Tracking API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# In-memory database
jobs_db: Dict[str, Job] = {}
pipelines_db: Dict[str, Pipeline] = {}

# Sample initial data
def generate_sample_data():
    # Create a sample pipeline
    pipeline_id = f"pipeline_{uuid.uuid4().hex[:10]}"
    pipelines_db[pipeline_id] = Pipeline(
        id=pipeline_id,
        name="Bay Area Forecast Pipeline",
        description="Pipeline for San Francisco Bay area forecasts and terrain data",
        status=PipelineStatus.ACTIVE,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        metadata={"region": "West Coast", "priority": "high"}
    )
    
    # Create sample wave forecast data
    wave_forecast_data = WaveForecastData(
        data=[
            WaveForecastEntry(time="2023-09-25 15:00", height=1.5, direction="SW", period=8.2),
            WaveForecastEntry(time="2023-09-25 16:00", height=1.7, direction="SW", period=8.4),
            WaveForecastEntry(time="2023-09-25 17:00", height=1.8, direction="WSW", period=8.5),
        ],
        location="San Francisco Bay",
        unit="metric"
    )
    
    # Create some initial jobs
    job1_id = f"job_{uuid.uuid4().hex[:10]}"
    job2_id = f"job_{uuid.uuid4().hex[:10]}"
    job3_id = f"job_{uuid.uuid4().hex[:10]}"
    job4_id = f"job_{uuid.uuid4().hex[:10]}"
    
    now = datetime.now()
    
    # Create jobs with different statuses and staggered timestamps
    jobs_db[job1_id] = Job(
        id=job1_id,
        pipeline_id=pipeline_id,
        type=JobType.FETCH_TERRAIN,
        status=JobStatus.PENDING,
        created_at=now - timedelta(days=7),
        updated_at=now - timedelta(days=7),
        args={"location": "San Francisco Bay", "resolution": "high", "format": "GeoJSON"},
        triggers=[],
        pipeline=pipelines_db[pipeline_id]
    )
    
    jobs_db[job2_id] = Job(
        id=job2_id,
        pipeline_id=pipeline_id,
        type=JobType.WEATHER_FORECAST,
        status=JobStatus.PROCESSING,
        created_at=now - timedelta(days=3, hours=12),
        updated_at=now - timedelta(hours=2),
        args={"location": "San Francisco Bay", "days": 5, "include_hourly": True},
        triggers=[],
        pipeline=pipelines_db[pipeline_id]
    )
    
    jobs_db[job3_id] = Job(
        id=job3_id,
        pipeline_id=pipeline_id,
        type=JobType.WAVE_FORECAST,
        status=JobStatus.COMPLETED,
        created_at=now - timedelta(days=1, hours=6),
        updated_at=now - timedelta(hours=5),
        args={"location": "San Francisco Bay", "days": 2, "include_direction": True},
        wave_forecast_data=wave_forecast_data,
        triggers=[],
        pipeline=pipelines_db[pipeline_id]
    )
    
    jobs_db[job4_id] = Job(
        id=job4_id,
        pipeline_id=pipeline_id,
        type=JobType.TIDE_FORECAST,
        status=JobStatus.FAILED,
        created_at=now - timedelta(hours=1),
        updated_at=now - timedelta(minutes=30),
        error_message="API connection timed out after 30 seconds",
        args={"location": "San Francisco Bay", "days": 3},
        triggers=[],
        pipeline=pipelines_db[pipeline_id]
    )
    
    # Set up job triggers
    jobs_db[job3_id].triggers = [jobs_db[job1_id]]

# Generate sample data at startup
generate_sample_data()

# API Routes

@app.get("/api/jobs", response_model=List[Job])
async def get_jobs(
    type: Optional[str] = None,
    status: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None
):
    filtered_jobs = list(jobs_db.values())
    
    # Apply filters
    if type:
        filtered_jobs = [job for job in filtered_jobs if job.type == type]
    
    if status:
        filtered_jobs = [job for job in filtered_jobs if job.status == status]
    
    if dateFrom:
        date_from = datetime.fromisoformat(dateFrom.replace('Z', '+00:00'))
        filtered_jobs = [job for job in filtered_jobs if job.created_at >= date_from]
    
    if dateTo:
        date_to = datetime.fromisoformat(dateTo.replace('Z', '+00:00'))
        filtered_jobs = [job for job in filtered_jobs if job.created_at <= date_to]
    
    # Sort by creation date (newest first)
    filtered_jobs.sort(key=lambda job: job.created_at, reverse=True)
    
    return filtered_jobs

@app.get("/api/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs_db[job_id]

@app.post("/api/jobs", response_model=Job)
async def create_job(payload: CreateJobPayload):
    job_id = f"job_{uuid.uuid4().hex[:10]}"
    
    # Validate pipeline exists
    if payload.pipeline_id not in pipelines_db:
        raise HTTPException(status_code=400, detail=f"Pipeline {payload.pipeline_id} not found")
    
    # Validate triggers
    triggers = []
    if payload.trigger_ids:
        for trigger_id in payload.trigger_ids:
            if trigger_id not in jobs_db:
                raise HTTPException(status_code=400, detail=f"Trigger job {trigger_id} not found")
            triggers.append(jobs_db[trigger_id])
    
    # Create new job
    new_job = Job(
        id=job_id,
        pipeline_id=payload.pipeline_id,
        type=payload.type,
        status=JobStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        args=payload.args,
        triggers=triggers,
        pipeline=pipelines_db[payload.pipeline_id]
    )
    
    jobs_db[job_id] = new_job
    return new_job

@app.post("/api/jobs/{job_id}/retry", response_model=Job)
async def retry_job(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    
    # Only failed or pending jobs can be retried
    if job.status not in [JobStatus.FAILED, JobStatus.PENDING]:
        raise HTTPException(status_code=400, detail="Only failed or pending jobs can be retried")
    
    # Update job status to pending
    job.status = JobStatus.PENDING
    job.updated_at = datetime.now()
    job.error_message = None
    
    return job

@app.get("/api/pipelines", response_model=List[Pipeline])
async def get_pipelines():
    return list(pipelines_db.values())

@app.get("/api/pipelines/{pipeline_id}", response_model=Pipeline)
async def get_pipeline(pipeline_id: str):
    if pipeline_id not in pipelines_db:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    return pipelines_db[pipeline_id]

@app.post("/api/pipelines", response_model=Pipeline)
async def create_pipeline(payload: CreatePipelinePayload):
    pipeline_id = f"pipeline_{uuid.uuid4().hex[:10]}"
    
    # Create new pipeline
    new_pipeline = Pipeline(
        id=pipeline_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        metadata=payload.metadata
    )
    
    pipelines_db[pipeline_id] = new_pipeline
    return new_pipeline

@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Remove job from other jobs' triggers
    for other_job in jobs_db.values():
        other_job.triggers = [t for t in other_job.triggers if t.id != job_id]
    
    # Delete the job
    del jobs_db[job_id]
    
    return {"message": "Job deleted successfully"}

# Root directory of the project
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
client_dir = os.path.join(root_dir, "client")
redirect_html = os.path.join(root_dir, "redirect.html")

# Set up static files
static_dir = os.path.join(client_dir, "public")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# For root path - serve the client HTML
@app.get("/dashboard", include_in_schema=False)
@app.get("/", include_in_schema=False)
async def root():
    index_html = os.path.join(static_dir, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)
    else:
        return {
            "message": "Job Tracking API is running",
            "documentation": "/docs",
            "endpoints": [
                {"method": "GET", "path": "/api/jobs", "description": "Get all jobs (with optional filters)"},
                {"method": "GET", "path": "/api/jobs/{job_id}", "description": "Get a specific job by ID"},
                {"method": "POST", "path": "/api/jobs", "description": "Create a new job"},
                {"method": "POST", "path": "/api/jobs/{job_id}/retry", "description": "Retry a failed job"},
                {"method": "DELETE", "path": "/api/jobs/{job_id}", "description": "Delete a job"}
            ],
            "frontend_url": "http://localhost:5000"
        }

# Handle other paths
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    if full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        return None  # Let FastAPI handle these routes
    elif full_path.startswith("static/"):
        # This should be handled by the static files mount
        return None
    elif full_path == "favicon.ico":
        favicon_path = os.path.join(static_dir, "favicon.ico")
        if os.path.exists(favicon_path):
            return FileResponse(favicon_path)
    
    # For any other path, serve the main HTML file (SPA approach)
    index_html = os.path.join(static_dir, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)
    
    return {"message": "Not found. API endpoints are available at /api/jobs", "documentation_url": "/docs"}

if __name__ == "__main__":
    # Running directly (not through Express)
    uvicorn.run(app, host="0.0.0.0", port=8000)

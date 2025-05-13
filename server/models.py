from enum import Enum
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

# Enums for job types and statuses
class JobType(str, Enum):
    FETCH_TERRAIN = "fetchTerrain"
    WEATHER_FORECAST = "weatherForecast"
    TIDE_FORECAST = "tideForecast"
    WAVE_FORECAST = "waveForecast"

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PipelineStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"

# Wave forecast data models
class WaveForecastEntry(BaseModel):
    time: str
    height: float
    direction: str
    period: float

class WaveForecastData(BaseModel):
    data: List[WaveForecastEntry]
    location: Optional[str] = None
    unit: Optional[str] = None

# Pipeline model
class Pipeline(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: PipelineStatus
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None

# Forward reference for Job (to handle circular dependency with triggers)
class Job(BaseModel):
    id: str
    pipeline_id: str
    type: JobType
    status: JobStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    args: Dict[str, Any]
    wave_forecast_data: Optional[WaveForecastData] = None
    triggers: List['Job'] = []
    pipeline: Optional[Pipeline] = None
    
    class Config:
        arbitrary_types_allowed = True

# Create job payload model
class CreateJobPayload(BaseModel):
    type: JobType
    pipeline_id: str
    args: Dict[str, Any]
    trigger_ids: Optional[List[str]] = None

# Create pipeline payload model
class CreatePipelinePayload(BaseModel):
    name: str
    description: Optional[str] = None
    status: PipelineStatus
    metadata: Optional[Dict[str, Any]] = None

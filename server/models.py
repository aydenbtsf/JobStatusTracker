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

# Forward reference for Job (to handle circular dependency with triggers)
class Job(BaseModel):
    id: str
    type: JobType
    status: JobStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    args: Dict[str, Any]
    wave_forecast_data: Optional[WaveForecastData] = None
    triggers: List['Job'] = []
    
    class Config:
        arbitrary_types_allowed = True

# Create job payload model
class CreateJobPayload(BaseModel):
    type: JobType
    args: Dict[str, Any]
    trigger_ids: Optional[List[str]] = None

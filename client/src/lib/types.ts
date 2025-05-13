import { JobStatus, JobType } from "@/schema";

// Pipeline status type
export type PipelineStatus = "active" | "archived" | "completed";

// Types matching the actual API response format (snake_case)
export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  status: PipelineStatus;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
}

export interface Job {
  id: string;
  pipeline_id: string;
  type: JobType;
  status: JobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  args: Record<string, any>;
  wave_forecast_data: WaveForecastData | null;
}

export interface JobWithTriggers extends Job {
  triggers: Job[];
}

export interface JobWithPipeline extends JobWithTriggers {
  pipeline: Pipeline;
}

export interface WaveForecastData {
  data: Array<{
    time: string;
    height: number;
    direction: string;
    period: number;
  }>;
  location?: string;
  unit?: string;
}

export interface JobFilters {
  type?: JobType | "";
  status?: JobStatus | "";
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateJobPayload {
  type: JobType;
  pipeline_id: string;
  args: Record<string, any>;
  trigger_ids?: string[];
}

export interface CreatePipelinePayload {
  name: string;
  description?: string;
  status: PipelineStatus;
  metadata?: Record<string, any>;
}
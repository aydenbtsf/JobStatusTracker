import { JobStatus, JobType } from "@shared/schema";

// Types matching the actual API response format (snake_case)
export interface Job {
  id: string;
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
  args: Record<string, any>;
  trigger_ids?: string[];
}
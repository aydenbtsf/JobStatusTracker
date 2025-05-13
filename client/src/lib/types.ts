import { Job, JobStatus, JobType } from "@shared/schema";

export interface JobWithTriggers extends Job {
  triggers: Job[];
  wave_forecast_data?: WaveForecastData;
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
import { Job, WaveForecastData, WaveForecastEntry, JobType, JobStatus } from "@shared/schema";

export interface JobWithTriggers extends Job {
  triggers: Job[];
  waveForecast?: WaveForecastData;
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
  triggerIds?: string[];
}

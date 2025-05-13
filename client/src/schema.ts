import { pgTable, text, serial, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type JobType = "fetchTerrain" | "weatherForecast" | "tideForecast" | "waveForecast";
export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type PipelineStatus = "active" | "archived" | "completed";

export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().$type<PipelineStatus>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id").notNull().references(() => pipelines.id),
  type: text("type").notNull().$type<JobType>(),
  status: text("status").notNull().$type<JobStatus>(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  args: jsonb("args").notNull().$type<Record<string, any>>(),
  waveForecastData: jsonb("wave_forecast_data").$type<WaveForecastData>(),
});

export type WaveForecastEntry = {
  time: string;
  height: number;
  direction: string;
  period: number;
};

export type WaveForecastData = {
  data: WaveForecastEntry[];
  location?: string;
  unit?: string;
};

export const jobTriggers = pgTable("job_triggers", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id),
  triggerId: text("trigger_id").notNull().references(() => jobs.id),
});

export const insertPipelineSchema = createInsertSchema(pipelines)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertJobSchema = createInsertSchema(jobs)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertJobTriggerSchema = createInsertSchema(jobTriggers)
  .omit({ id: true });

export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type Pipeline = typeof pipelines.$inferSelect;
export type JobTrigger = typeof jobTriggers.$inferSelect;

// Extended types for frontend use
export interface JobWithTriggers extends Job {
  triggers: Job[];
}

export interface JobWithPipeline extends JobWithTriggers {
  pipeline: Pipeline;
}

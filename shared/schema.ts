import { pgTable, text, serial, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type JobType = "fetchTerrain" | "weatherForecast" | "tideForecast" | "waveForecast";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull().$type<JobType>(),
  status: text("status").notNull().$type<JobStatus>(),
  errorMessage: text("error_message"),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow(),
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

export const insertJobSchema = createInsertSchema(jobs)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertJobTriggerSchema = createInsertSchema(jobTriggers)
  .omit({ id: true });

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type JobTrigger = typeof jobTriggers.$inferSelect;

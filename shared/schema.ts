import { z } from "zod";
import { Job as PrismaJob, User as PrismaUser, JobTrigger as PrismaJobTrigger } from "@prisma/client";

export type JobType = "fetchTerrain" | "weatherForecast" | "tideForecast" | "waveForecast";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

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

export type User = PrismaUser;

export type Job = PrismaJob & {
  args: Record<string, any>;
  waveForecastData?: WaveForecastData;
};

export type JobWithTriggers = Job & {
  triggeredBy?: JobTrigger[];
  triggerFor?: JobTrigger[];
};

export type JobTrigger = PrismaJobTrigger;

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional(),
});

export const insertJobSchema = z.object({
  type: z.enum(["fetchTerrain", "weatherForecast", "tideForecast", "waveForecast"]),
  status: z.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  errorMessage: z.string().optional(),
  args: z.record(z.any()),
  waveForecastData: z.object({
    data: z.array(z.object({
      time: z.string(),
      height: z.number(),
      direction: z.string(),
      period: z.number(),
    })),
    location: z.string().optional(),
    unit: z.string().optional(),
  }).optional(),
});

export const insertJobTriggerSchema = z.object({
  jobId: z.string(),
  triggerId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertJobTrigger = z.infer<typeof insertJobTriggerSchema>;

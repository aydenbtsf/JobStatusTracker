import { type User, type InsertUser, type Job, type InsertJob, type JobWithTriggers } from "@shared/schema";
import { prisma } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJob(id: string): Promise<Job | undefined>;
  getJobWithTriggers(id: string): Promise<JobWithTriggers | undefined>;
  getJobs(): Promise<Job[]>;
  getJobsWithFilters(filters: { type?: string; status?: string; dateFrom?: string; dateTo?: string }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return prisma.user.create({
      data: insertUser
    });
  }
  
  // Job methods
  async getJob(id: string): Promise<Job | undefined> {
    return prisma.job.findUnique({
      where: { id }
    });
  }
  
  async getJobWithTriggers(id: string): Promise<JobWithTriggers | undefined> {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        triggeredBy: {
          include: {
            trigger: true
          }
        },
        triggerFor: {
          include: {
            job: true
          }
        }
      }
    });
    
    if (!job) return undefined;
    
    // Transform the data to match our expected format
    const triggers = job.triggerFor.map(relation => relation.job);
    
    return {
      ...job,
      args: job.args as Record<string, any>,
      waveForecastData: job.waveForecastData as any,
      triggers
    } as unknown as JobWithTriggers;
  }
  
  async getJobs(): Promise<Job[]> {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return jobs.map(job => ({
      ...job,
      args: job.args as Record<string, any>,
      waveForecastData: job.waveForecastData as any
    }));
  }
  
  async getJobsWithFilters(filters: { type?: string; status?: string; dateFrom?: string; dateTo?: string }): Promise<Job[]> {
    const where: any = {};
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(filters.dateFrom)
      };
    }
    
    if (filters.dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.dateTo)
      };
    }
    
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return jobs.map(job => ({
      ...job,
      args: job.args as Record<string, any>,
      waveForecastData: job.waveForecastData as any
    }));
  }
  
  async createJob(job: InsertJob): Promise<Job> {
    const jobId = `job_${Math.random().toString(36).substring(2, 12)}`;
    
    const createdJob = await prisma.job.create({
      data: {
        id: jobId,
        type: job.type,
        status: job.status,
        errorMessage: job.errorMessage,
        args: job.args as any,
        waveForecastData: job.waveForecastData as any
      }
    });
    
    return {
      ...createdJob,
      args: createdJob.args as Record<string, any>,
      waveForecastData: createdJob.waveForecastData as any
    };
  }
  
  async updateJob(id: string, updateData: Partial<Job>): Promise<Job | undefined> {
    try {
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          ...updateData,
          args: updateData.args as any,
          waveForecastData: updateData.waveForecastData as any,
          updatedAt: new Date()
        }
      });
      
      return {
        ...updatedJob,
        args: updatedJob.args as Record<string, any>,
        waveForecastData: updatedJob.waveForecastData as any
      };
    } catch (error) {
      console.error('Error updating job:', error);
      return undefined;
    }
  }
  
  async deleteJob(id: string): Promise<boolean> {
    try {
      await prisma.job.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }
  
  // JobTrigger methods
  async createJobTrigger(jobId: string, triggerId: string): Promise<void> {
    await prisma.jobTrigger.create({
      data: {
        jobId,
        triggerId
      }
    });
  }
}

export const storage = new DatabaseStorage();

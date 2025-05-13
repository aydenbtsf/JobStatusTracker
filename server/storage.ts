import { jobs, users, type User, type InsertUser, type Job, type InsertJob } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJob(id: string): Promise<Job | undefined>;
  getJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobsData: Map<string, Job>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.jobsData = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Job methods
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobsData.get(id);
  }
  
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobsData.values());
  }
  
  async createJob(job: InsertJob): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: `job_${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.jobsData.set(newJob.id, newJob);
    return newJob;
  }
  
  async updateJob(id: string, updateData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobsData.get(id);
    if (!job) return undefined;
    
    const updatedJob: Job = {
      ...job,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.jobsData.set(id, updatedJob);
    return updatedJob;
  }
  
  async deleteJob(id: string): Promise<boolean> {
    return this.jobsData.delete(id);
  }
}

export const storage = new MemStorage();

// Job and Result types matching the Replit backend schema

export interface Job {
  id: number;
  url: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: string | null;
  resultCount: number;
  error: string | null;
  createdAt: string;
}

export interface Result {
  id: number;
  jobId: number;
  name: string;
  website: string | null;
  filtered: number; // 1 = excluded by filter, 0 = included
  createdAt: string;
}

export interface JobWithResults extends Job {
  results: Result[];
}

export interface CreateJobInput {
  url: string;
}

export interface ApiError {
  message: string;
  field?: string;
}

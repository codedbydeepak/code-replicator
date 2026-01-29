import { Job, JobWithResults, CreateJobInput, ApiError } from "./types";

// Backend URL configuration - stored in localStorage
const BACKEND_URL_KEY = "maps-scraper-backend-url";

export function getBackendUrl(): string {
  const stored = localStorage.getItem(BACKEND_URL_KEY);
  return stored || "";
}

export function setBackendUrl(url: string): void {
  // Remove trailing slash
  const cleaned = url.replace(/\/$/, "");
  localStorage.setItem(BACKEND_URL_KEY, cleaned);
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<{ data?: T; error?: ApiError }> {
  const baseUrl = getBackendUrl();
  
  if (!baseUrl) {
    return { error: { message: "Backend URL not configured. Please set your Replit URL in settings." } };
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data as ApiError };
    }

    return { data: data as T };
  } catch (error) {
    console.error("API Error:", error);
    return {
      error: {
        message: error instanceof Error 
          ? `Network error: ${error.message}. Make sure your Replit backend is running.`
          : "Failed to connect to backend",
      },
    };
  }
}

export const api = {
  jobs: {
    create: (input: CreateJobInput) =>
      fetchApi<Job>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    get: (id: number) => fetchApi<JobWithResults>(`/api/jobs/${id}`),

    list: () => fetchApi<Job[]>("/api/jobs"),
  },
};

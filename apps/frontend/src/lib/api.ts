import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response types
export interface TestResponse {
  message: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

// Resume related types
export interface Resume {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date?: string;
  }>;
  work: Array<{
    company: string;
    position: string;
    description: string;
    start_date: string;
    end_date?: string;
  }>;
  skills: string[];
  certificates: string[];
}

export interface Suggestion {
  field: string;
  current: string;
  suggested: string;
  reason: string;
}

export interface ParseResumeResponse {
  resume: Resume;
  suggestions: Suggestion[];
}

export interface ParseResumeRequest {
  text: string;
}

// API functions
export const api = {
  // Test endpoint
  test: async (): Promise<TestResponse> => {
    const response = await apiClient.get<TestResponse>('/test');
    return response.data;
  },

  // Health check endpoint
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/healthz');
    return response.data;
  },

  // Resume parsing endpoint
  parseResume: async (text: string): Promise<ParseResumeResponse> => {
    const response = await apiClient.post<ParseResumeResponse>('/api/parse_resume', {
      text,
    });
    return response.data;
  },

  // Get current resume
  getResume: async (): Promise<Resume | null> => {
    try {
      const response = await apiClient.get<{resume: Resume}>('/api/resume');
      return response.data.resume;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default apiClient; 
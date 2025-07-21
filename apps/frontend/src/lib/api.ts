import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance for backend API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for frontend API routes
const frontendApiClient = axios.create({
  baseURL: '',  // Use relative URLs for frontend API routes
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
    suggestions?: Suggestion[];
  };
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date?: string;
    suggestions?: Suggestion[];
  }>;
  work: Array<{
    company: string;
    position: string;
    description: string;
    start_date: string;
    end_date?: string;
    achievements?: string[];
    suggestions?: Suggestion[];
  }>;
  skills: Array<{
    name: string;
    level?: string;
    category?: string;
    suggestions?: Suggestion[];
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
    suggestions?: Suggestion[];
  }>;
}

export interface GetResumeResponse {
  resume: Resume | null;
  suggestions: Suggestion[];
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

export interface AcceptSuggestionResponse {
  resume: Resume;
}

export interface AcceptSuggestionRequest {
  field: string;
  suggested: string;
}

// Chat related types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggestion?: Suggestion;
}

export interface ChatRequest {
  message: string;
  referencedContent?: string;
}

export interface ChatResponse {
  reply: string;
  suggestion?: Suggestion;
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
      const response = await apiClient.get<Resume>('/api/resume');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Accept suggestion
  acceptSuggestion: async (field: string, suggested: string): Promise<Resume> => {
    const response = await apiClient.post<AcceptSuggestionResponse>('/api/accept_suggestion', {
      field,
      suggested,
    });
    return response.data.resume;
  },

  // Save resume
  saveResume: async (resume: Resume): Promise<void> => {
    await apiClient.post('/api/resume', {
      resume,
    });
  },

  // Chat endpoint - use frontend API route
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await frontendApiClient.post<ChatResponse>('/api/chat', request);
    return response.data;
  },
};

export default apiClient; 
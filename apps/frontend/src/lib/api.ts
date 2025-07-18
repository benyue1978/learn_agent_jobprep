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
};

export default apiClient; 
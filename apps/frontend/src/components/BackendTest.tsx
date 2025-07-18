'use client';

import { useState, useEffect } from 'react';
import { api, TestResponse, HealthResponse } from '@/lib/api';

export default function BackendTest() {
  const [testResult, setTestResult] = useState<TestResponse | null>(null);
  const [healthResult, setHealthResult] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [testData, healthData] = await Promise.all([
        api.test(),
        api.health()
      ]);
      
      setTestResult(testData);
      setHealthResult(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testBackend();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Backend API Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing connection to FastAPI backend
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={testBackend}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Test Endpoint</h3>
              <div className="mt-2 text-sm text-green-700">
                {testResult.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {healthResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Health Check</h3>
              <div className="mt-2 text-sm text-blue-700">
                <div>Status: <span className="font-medium">{healthResult.status}</span></div>
                <div>Service: <span className="font-medium">{healthResult.service}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          API Information
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>Base URL: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</code></div>
          <div>Test Endpoint: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">GET /test</code></div>
          <div>Health Endpoint: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">GET /healthz</code></div>
        </div>
      </div>
    </div>
  );
} 
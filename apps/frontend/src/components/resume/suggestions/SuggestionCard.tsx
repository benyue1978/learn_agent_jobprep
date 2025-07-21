import { useState } from 'react';
import { Suggestion } from '@/lib/api';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (field: string, suggested: string) => Promise<void>;
  onReject: () => void;
}

export default function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept(suggestion.field, suggestion.suggested);
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            AI 建议
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Current content */}
        <div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            当前内容：
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {suggestion.current}
          </div>
        </div>

        {/* Suggested content */}
        <div>
          <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
            建议内容：
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
            {suggestion.suggested}
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
            修改理由：
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            {suggestion.reason}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            接受
          </button>
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            拒绝
          </button>
        </div>
      </div>
    </div>
  );
} 
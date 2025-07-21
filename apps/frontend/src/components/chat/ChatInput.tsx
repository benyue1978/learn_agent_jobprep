'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string, referencedContent?: string) => void;
  isLoading: boolean;
  initialReferencedContent?: string;
}

export default function ChatInput({ onSendMessage, isLoading, initialReferencedContent }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [referencedContent, setReferencedContent] = useState<string | undefined>(initialReferencedContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialReferencedContent) {
      setReferencedContent(initialReferencedContent);
    }
  }, [initialReferencedContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    onSendMessage(inputValue, referencedContent);
    setInputValue('');
    setReferencedContent(undefined);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeReferencedContent = () => {
    setReferencedContent(undefined);
  };

  return (
    <div className="space-y-3">
      {/* Referenced Content */}
      {referencedContent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                引用内容：
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 line-clamp-2">
                {referencedContent}
              </div>
            </div>
            <button
              onClick={removeReferencedContent}
              className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={referencedContent ? "基于引用内容提问..." : "输入你的问题..."}
            className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={1}
            maxLength={500}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
} 
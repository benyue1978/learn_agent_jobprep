'use client';

import { ChatMessage, Suggestion } from '@/lib/api';
import SuggestionCard from '../resume/suggestions/SuggestionCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionAccept: (suggestion: Suggestion) => void;
}

export default function MessageBubble({ message, onSuggestionAccept }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          {timestamp && (
            <div className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {timestamp}
            </div>
          )}
        </div>
        
        {/* Suggestion Card */}
        {message.suggestion && (
          <div className="mt-3">
            <SuggestionCard
              suggestion={message.suggestion}
              onAccept={() => onSuggestionAccept(message.suggestion!)}
              onReject={() => {
                // Handle reject locally - just hide the suggestion
                console.log('Suggestion rejected:', message.suggestion);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 
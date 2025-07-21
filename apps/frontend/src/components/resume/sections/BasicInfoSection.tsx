import { useState } from 'react';
import { Suggestion } from '@/lib/api';
import SuggestionCard from '../suggestions/SuggestionCard';

interface BasicInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  suggestions?: Suggestion[];
}

interface BasicInfoSectionProps {
  basicInfo: BasicInfo;
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
}

export default function BasicInfoSection({ basicInfo, onSuggestionAccept }: BasicInfoSectionProps) {
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  const handleAccept = async (field: string, suggested: string) => {
    await onSuggestionAccept(field, suggested);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const visibleSuggestions = basicInfo.suggestions?.filter(
    suggestion => !rejectedSuggestions.has(suggestion.field)
  ) || [];

  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          基本信息
        </h2>
        <div className="flex-1 ml-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {basicInfo.name}
            </h3>
            {basicInfo.summary && (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {basicInfo.summary}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{basicInfo.email}</span>
            </div>
            
            {basicInfo.phone && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{basicInfo.phone}</span>
              </div>
            )}
            
            {basicInfo.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{basicInfo.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Suggestions */}
        {visibleSuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={`${suggestion.field}-${index}`}
            suggestion={suggestion}
            onAccept={handleAccept}
            onReject={() => handleReject(suggestion)}
          />
        ))}
      </div>
    </section>
  );
} 
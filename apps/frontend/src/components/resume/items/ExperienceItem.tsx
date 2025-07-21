import { useState } from 'react';
import { Suggestion } from '@/lib/api';
import SuggestionCard from '../suggestions/SuggestionCard';

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  achievements?: string[];
  suggestions?: Suggestion[];
}

interface ExperienceItemProps {
  experience: WorkExperience;
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
}

export default function ExperienceItem({ experience, onSuggestionAccept }: ExperienceItemProps) {
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  const handleAccept = async (field: string, suggested: string) => {
    await onSuggestionAccept(field, suggested);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const visibleSuggestions = experience.suggestions?.filter(
    suggestion => !rejectedSuggestions.has(suggestion.field)
  ) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {experience.position}
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {experience.start_date} - {experience.end_date || '至今'}
        </span>
      </div>
      
      <div className="text-blue-600 dark:text-blue-400 font-medium mb-2">
        {experience.company}
      </div>
      
      <div className="text-gray-700 dark:text-gray-300 mb-3">
        {experience.description}
      </div>
      
      {experience.achievements && experience.achievements.length > 0 && (
        <div className="mb-3">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            主要成就：
          </h5>
          <ul className="list-disc list-inside space-y-1">
            {experience.achievements.map((achievement, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      )}
      
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
  );
} 
import { useState } from 'react';
import { Suggestion } from '@/lib/api';
import SuggestionCard from '../suggestions/SuggestionCard';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  suggestions?: Suggestion[];
}

interface EducationItemProps {
  education: Education;
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
}

export default function EducationItem({ education, onSuggestionAccept }: EducationItemProps) {
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  const handleAccept = async (field: string, suggested: string) => {
    await onSuggestionAccept(field, suggested);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const visibleSuggestions = education.suggestions?.filter(
    suggestion => !rejectedSuggestions.has(suggestion.field)
  ) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {education.institution}
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {education.start_date} - {education.end_date || '至今'}
        </span>
      </div>
      
      <div className="text-gray-700 dark:text-gray-300 mb-1">
        {education.degree} - {education.field_of_study}
      </div>
      
      {education.gpa && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          GPA: {education.gpa}
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
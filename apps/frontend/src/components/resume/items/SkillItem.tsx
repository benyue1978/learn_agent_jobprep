import { useState } from 'react';
import { Suggestion } from '@/lib/api';
import SuggestionCard from '../suggestions/SuggestionCard';
import ReferenceButton from '../ReferenceButton';

interface Skill {
  name: string;
  level?: string;
  category?: string;
  suggestions?: Suggestion[];
}

interface SkillItemProps {
  skill: Skill;
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
  onReference: (content: string) => void;
}

export default function SkillItem({ skill, onSuggestionAccept, onReference }: SkillItemProps) {
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  const handleAccept = async (field: string, suggested: string) => {
    await onSuggestionAccept(field, suggested);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const visibleSuggestions = skill.suggestions?.filter(
    suggestion => !rejectedSuggestions.has(suggestion.field)
  ) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {skill.name}
          </h4>
          {skill.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {skill.category}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {skill.level && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {skill.level}
            </span>
          )}
          <ReferenceButton
            content={`技能：${skill.name}${skill.level ? ` (${skill.level})` : ''}${skill.category ? ` - ${skill.category}` : ''}`}
            onReference={onReference}
          />
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
  );
} 
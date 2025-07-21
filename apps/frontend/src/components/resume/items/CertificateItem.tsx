import { useState } from 'react';
import { Suggestion } from '@/lib/api';
import SuggestionCard from '../suggestions/SuggestionCard';
import ReferenceButton from '../ReferenceButton';

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  description?: string;
  suggestions?: Suggestion[];
}

interface CertificateItemProps {
  certificate: Certificate;
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
  onReference: (content: string) => void;
}

export default function CertificateItem({ certificate, onSuggestionAccept, onReference }: CertificateItemProps) {
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  const handleAccept = async (field: string, suggested: string) => {
    await onSuggestionAccept(field, suggested);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedSuggestions(prev => new Set(prev).add(suggestion.field));
  };

  const visibleSuggestions = certificate.suggestions?.filter(
    suggestion => !rejectedSuggestions.has(suggestion.field)
  ) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {certificate.name}
          </h4>
          <div className="text-blue-600 dark:text-blue-400 font-medium mb-2">
            {certificate.issuer}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {certificate.date}
          </span>
          <ReferenceButton
            content={`证书：${certificate.name}，${certificate.issuer}，${certificate.date}`}
            onReference={onReference}
          />
        </div>
      </div>
      
      {certificate.description && (
        <div className="relative">
          <div className="text-gray-700 dark:text-gray-300 text-sm pr-16">
            {certificate.description}
          </div>
          <div className="absolute top-0 right-0">
            <ReferenceButton
              content={`证书描述：${certificate.description}`}
              onReference={onReference}
            />
          </div>
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
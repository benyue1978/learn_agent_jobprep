import EducationItem from '../items/EducationItem';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
}

interface EducationSectionProps {
  education: Education[];
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
  onReference: (content: string) => void;
}

export default function EducationSection({ education, onSuggestionAccept, onReference }: EducationSectionProps) {
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          教育经历
        </h2>
        <div className="flex-1 ml-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="space-y-4">
        {education.map((edu, index) => (
          <EducationItem 
            key={index} 
            education={edu} 
            onSuggestionAccept={onSuggestionAccept}
            onReference={onReference}
          />
        ))}
      </div>
    </section>
  );
} 
import SkillItem from '../items/SkillItem';

interface Skill {
  name: string;
  level?: string;
  category?: string;
}

interface SkillsSectionProps {
  skills: Skill[];
  onSuggestionAccept: (field: string, suggested: string) => Promise<void>;
  onReference: (content: string) => void;
}

export default function SkillsSection({ skills, onSuggestionAccept, onReference }: SkillsSectionProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          技能专长
        </h2>
        <div className="flex-1 ml-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <SkillItem 
            key={index} 
            skill={skill} 
            onSuggestionAccept={onSuggestionAccept}
            onReference={onReference}
          />
        ))}
      </div>
    </section>
  );
} 
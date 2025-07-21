import ExperienceItem from '../items/ExperienceItem';

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  achievements?: string[];
}

interface ExperienceSectionProps {
  work: WorkExperience[];
}

export default function ExperienceSection({ work }: ExperienceSectionProps) {
  if (!work || work.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          工作经历
        </h2>
        <div className="flex-1 ml-4 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="space-y-4">
        {work.map((exp, index) => (
          <ExperienceItem key={index} experience={exp} />
        ))}
      </div>
    </section>
  );
} 
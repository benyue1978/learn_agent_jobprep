interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
}

interface EducationItemProps {
  education: Education;
}

export default function EducationItem({ education }: EducationItemProps) {
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
      
      {/* TODO: 显示建议 */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
          // TODO: 显示建议
        </div>
      </div>
    </div>
  );
} 
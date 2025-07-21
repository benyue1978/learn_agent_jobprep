interface Skill {
  name: string;
  level?: string;
  category?: string;
}

interface SkillItemProps {
  skill: Skill;
}

export default function SkillItem({ skill }: SkillItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {skill.name}
          </h4>
          {skill.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {skill.category}
            </div>
          )}
        </div>
        
        {skill.level && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            {skill.level}
          </span>
        )}
      </div>
      
      {/* TODO: 显示建议 */}
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
          // TODO: 显示建议
        </div>
      </div>
    </div>
  );
} 
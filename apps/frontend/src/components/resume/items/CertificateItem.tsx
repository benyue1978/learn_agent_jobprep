interface Certificate {
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

interface CertificateItemProps {
  certificate: Certificate;
}

export default function CertificateItem({ certificate }: CertificateItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {certificate.name}
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {certificate.date}
        </span>
      </div>
      
      <div className="text-blue-600 dark:text-blue-400 font-medium mb-2">
        {certificate.issuer}
      </div>
      
      {certificate.description && (
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          {certificate.description}
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
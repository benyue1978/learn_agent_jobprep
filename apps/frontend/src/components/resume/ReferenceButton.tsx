'use client';

interface ReferenceButtonProps {
  content: string;
  onReference: (content: string) => void;
  className?: string;
}

export default function ReferenceButton({ content, onReference, className = '' }: ReferenceButtonProps) {
  const handleClick = () => {
    onReference(content);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 ${className}`}
      title="引用此内容并提问"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
} 
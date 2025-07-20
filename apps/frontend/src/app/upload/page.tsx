'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function UploadPage() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeText.trim()) {
      setError('请输入简历内容');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.parseResume(resumeText);
      router.push('/edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析简历时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              开始完善你的求职档案
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              粘贴你的简历内容，我们将使用 AI 技术帮你分析和优化
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Textarea */}
              <div>
                <label 
                  htmlFor="resume-text" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  简历内容
                </label>
                <textarea
                  id="resume-text"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="请粘贴你的简历内容（支持 Markdown 或纯文本格式）..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  支持 Markdown 格式或纯文本格式的简历内容
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">错误</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !resumeText.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中...
                    </div>
                  ) : (
                    '确认并分析'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">
              💡 使用提示
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li>• 支持 Markdown 格式的简历内容</li>
              <li>• 支持纯文本格式的简历内容</li>
              <li>• AI 将自动解析并结构化你的简历信息</li>
              <li>• 系统会提供优化建议来改进你的简历</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
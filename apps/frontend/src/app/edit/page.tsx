'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Resume } from '@/lib/api';
import BasicInfoSection from '@/components/resume/sections/BasicInfoSection';
import EducationSection from '@/components/resume/sections/EducationSection';
import ExperienceSection from '@/components/resume/sections/ExperienceSection';
import SkillsSection from '@/components/resume/sections/SkillsSection';
import CertificatesSection from '@/components/resume/sections/CertificatesSection';

export default function EditPage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSuggestionAccept = async (field: string, suggested: string) => {
    try {
      const updatedResume = await api.acceptSuggestion(field, suggested);
      setResume(updatedResume);
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      // Optionally show error message to user
    }
  };

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const resumeData = await api.getResume();
        setResume(resumeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取简历数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">加载错误</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/upload')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      重新上传简历
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
              <div className="mb-4">
                <svg className="h-12 w-12 text-yellow-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                暂无简历内容
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                请先上传你的简历内容
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                上传简历
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              简历编辑
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看和编辑你的结构化简历数据
            </p>
          </div>

          {/* Resume Sections */}
          <div className="space-y-8">
            <BasicInfoSection basicInfo={resume.basics} onSuggestionAccept={handleSuggestionAccept} />
            <EducationSection education={resume.education} onSuggestionAccept={handleSuggestionAccept} />
            <ExperienceSection work={resume.work} onSuggestionAccept={handleSuggestionAccept} />
            <SkillsSection skills={resume.skills} onSuggestionAccept={handleSuggestionAccept} />
            <CertificatesSection certificates={resume.certificates} onSuggestionAccept={handleSuggestionAccept} />
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={() => router.push('/test')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看测试页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
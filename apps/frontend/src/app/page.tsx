'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkResumeStatus = async () => {
      try {
        const resume = await api.getResume();
        
        if (resume) {
          // If resume exists, redirect to edit page
          router.push('/edit');
        } else {
          // If no resume, redirect to upload page
          router.push('/upload');
        }
      } catch (error) {
        // If there's an error, redirect to upload page as fallback
        console.error('Error checking resume status:', error);
        router.push('/upload');
      } finally {
        setLoading(false);
      }
    };

    checkResumeStatus();
  }, [router]);

  // Show loading state while checking resume status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在检查简历状态...</p>
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">正在跳转...</p>
      </div>
    </div>
  );
}

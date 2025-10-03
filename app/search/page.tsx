'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since search functionality is on the main page
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to search...</p>
      </div>
    </div>
  );
}

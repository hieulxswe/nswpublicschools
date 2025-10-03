import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#002664] border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Schools Data</h3>
          <p className="text-gray-600">Fetching the latest NSW public schools information...</p>
        </div>
      </div>
    </div>
  );
}

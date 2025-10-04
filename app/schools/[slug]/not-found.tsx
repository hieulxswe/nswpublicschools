import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
        <p className="text-gray-600 mb-6">
          The school you're looking for doesn't exist or may have been moved.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/search"
            className="block w-full px-4 py-2 bg-[#002664] text-white font-medium rounded-lg hover:bg-[#001a4d] transition-colors duration-200"
          >
            Search Schools
          </Link>
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please check the school name and try again.
          </p>
        </div>
      </div>
    </div>
  );
}

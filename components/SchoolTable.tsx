import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School } from '@/types/school';
import { calculateDistance } from '@/utils/distance';
import { generateSlug, generateUniqueSlugs } from '@/utils/slug';

interface SchoolTableProps {
  schools: School[];
  currentPage: number;
  itemsPerPage: number;
  userLocation?: { lat: number; lon: number };
}

export default function SchoolTable({ schools, currentPage, itemsPerPage, userLocation }: SchoolTableProps) {
  const router = useRouter();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchools = schools.slice(startIndex, endIndex);
  
  // Generate unique slugs for all schools to handle conflicts
  const slugMap = generateUniqueSlugs(schools);

  const handleSchoolClick = (school: School) => {
    // Find the unique slug for this school
    const schoolSlug = Array.from(slugMap.entries()).find(([_, s]) => s.School_code === school.School_code)?.[0];
    if (schoolSlug) {
      router.push(`/schools/${schoolSlug}`);
    } else {
      // Fallback to basic slug generation
      const fallbackSlug = generateSlug(school.School_name, school.School_code);
      router.push(`/schools/${fallbackSlug}`);
    }
  };

  const handleCopyLink = async (school: School, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Find the unique slug for this school
    const schoolSlug = Array.from(slugMap.entries()).find(([_, s]) => s.School_code === school.School_code)?.[0];
    const finalSlug = schoolSlug || generateSlug(school.School_name, school.School_code);
    const schoolUrl = `${window.location.origin}/schools/${finalSlug}`;
    
    try {
      await navigator.clipboard.writeText(schoolUrl);
      setCopiedStates(prev => ({ ...prev, [school.School_code]: true }));
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [school.School_code]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = schoolUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedStates(prev => ({ ...prev, [school.School_code]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [school.School_code]: false }));
      }, 2000);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
    return phone;
  };

  const formatEmail = (email: string) => {
    if (!email) return 'N/A';
    return email;
  };

  const formatWebsite = (website: string) => {
    if (!website) return 'N/A';
    return website.startsWith('http') ? website : `https://${website}`;
  };

  const getDistance = (school: School) => {
    if (!userLocation || !school.Latitude || !school.Longitude) return null;
    return calculateDistance(userLocation.lat, userLocation.lon, school.Latitude, school.Longitude);
  };

  const isNearestSchool = (school: School) => {
    if (!userLocation) return false;
    const distance = getDistance(school);
    return distance !== null && distance <= 5; // Within 5km
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-brand-primary">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                School Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Suburb
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Postcode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Email
              </th>
              {userLocation && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Distance
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
          {currentSchools.map((school, index) => {
            const distance = getDistance(school);
            const isNearest = isNearestSchool(school);
            
            return (
            <tr 
              key={`${school.School_name}-${index}`} 
              className={`
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} 
                hover:bg-gray-100 transition-colors duration-200 
                ${isNearest ? 'bg-brand-secondary/10 border-l-4 border-brand-secondary shadow-sm' : ''}
              `}
            >
              <td className="px-6 py-5">
                <div className="text-sm font-semibold text-gray-900">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleSchoolClick(school)}
                      className="brand-primary hover:brand-secondary underline hover:no-underline transition-all duration-200 font-medium text-left"
                    >
                      {school.School_name || 'N/A'}
                    </button>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={(e) => handleCopyLink(school, e)}
                        className={`flex items-center space-x-1 transition-all duration-200 px-2 py-1 rounded-md hover:bg-gray-100 ${
                          copiedStates[school.School_code] 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-[#002664] hover:text-[#d7153a]'
                        }`}
                        title="Copy shareable link to clipboard"
                        aria-label="Copy shareable link to clipboard"
                      >
                        {copiedStates[school.School_code] ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="hidden sm:inline">Shareable Link</span>
                          </>
                        )}
                      </button>
                      {school.Website && (
                        <a
                          href={formatWebsite(school.Website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 underline px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="text-sm text-gray-700">
                  {school.Town_suburb || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="text-sm text-gray-700 font-mono">
                  {school.Postcode || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="text-sm text-gray-700">
                  {formatPhoneNumber(school.Phone)}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="text-sm text-gray-700">
                  {formatEmail(school.School_Email)}
                </div>
              </td>
              {userLocation && (
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-700 font-medium">
                    {distance !== null ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary text-white">
                        {distance.toFixed(1)} km
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      
      {currentSchools.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
}

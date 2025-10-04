'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExtendedSchoolData } from '@/utils/api';
import SchoolStatsChart from './SchoolStatsChart';
import MapSection from './MapSection';
import ImageGallery from './ImageGallery';
import ActivitiesList from './ActivitiesList';

interface SchoolDetailPageProps {
  school: ExtendedSchoolData;
  slug: string;
}

const SchoolDetailPage: React.FC<SchoolDetailPageProps> = ({ school, slug }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    statistics: true,
    programs: true,
    images: true,
    map: true,
    details: false,
    contact: false,
  });

  const isMeaningfulValue = (val: unknown): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'number') return true;
    const s = String(val).trim();
    if (s === '') return false;
    const lower = s.toLowerCase();
    if (lower === 'n' || lower === 'n/a' || lower === 'na' || lower === 'not applicable') return false;
    return true;
  };

  const renderRow = (label: string, value?: string | number, hint?: string) => {
    if (!isMeaningfulValue(value)) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 border-b border-gray-100 last:border-b-0">
        <div className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {hint && (
            <span
              className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-gray-100 text-gray-600"
              title={hint}
              aria-label={hint}
            >
              i
            </span>
          )}
        </div>
        <div className="text-sm text-gray-900 break-words">{value}</div>
      </div>
    );
  };

  const Section: React.FC<{ id: string; title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ 
    id, 
    title, 
    children, 
    defaultOpen = false 
  }) => {
    const isOpen = openSections[id] ?? defaultOpen;
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSections((s) => ({ ...s, [id]: !s[id] }))}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-base sm:text-lg font-semibold text-[#002664]">{title}</h3>
          <svg
            className={`w-5 h-5 text-[#002664] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-4 sm:px-6 py-4">{children}</div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-[#002664] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href="/search" className="hover:text-[#002664] transition-colors">
                Search Schools
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium" aria-current="page">
              {school.School_name}
            </li>
          </ol>
        </nav>

        {/* School Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#002664] mb-2">
                {school.School_name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {school.Town_suburb} {school.Postcode}
              </p>
              {school.Street && (
                <p className="text-gray-700 mb-4">
                  {school.Street}
                </p>
              )}
            </div>
            
            <div className="flex flex-col space-y-4">
              {/* School Badges */}
              <div className="flex flex-wrap gap-2">
                {school.Level_of_schooling && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#002664] text-white">
                    {school.Level_of_schooling}
                  </span>
                )}
                {school.Selective_school === 'Y' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Selective School
                  </span>
                )}
                {school.Opportunity_class === 'Y' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Opportunity Class
                  </span>
                )}
                {school.School_specialty_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {school.School_specialty_type}
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                {school.Phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${school.Phone}`} className="text-[#002664] hover:text-[#d7153a] transition-colors">
                      {school.Phone}
                    </a>
                  </div>
                )}
                {school.School_Email && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${school.School_Email}`} className="text-[#002664] hover:text-[#d7153a] transition-colors">
                      {school.School_Email}
                    </a>
                  </div>
                )}
                {school.Website && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <a
                      href={school.Website.startsWith('http') ? school.Website : `https://${school.Website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#002664] hover:text-[#d7153a] transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {/* School Statistics */}
          <div>
            <SchoolStatsChart school={school} />
          </div>

          {/* Programs & Activities */}
          {(school.programs && school.programs.length > 0) || 
           (school.extracurricular && school.extracurricular.length > 0) ? (
            <div>
              <ActivitiesList 
                programs={school.programs || []} 
                extracurricular={school.extracurricular || []} 
                schoolName={school.School_name} 
              />
            </div>
          ) : null}

          {/* Detailed Information Sections */}
          <div className="space-y-4">
            <Section id="details" title="Detailed Information" defaultOpen={false}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="space-y-0">
                    {renderRow('ICSEA Value', school.ICSEA_value, 'Index of Community Socio-Educational Advantage')}
                    {renderRow('Enrollment (FTE)', school.latest_year_enrolment_FTE, 'Full-time equivalent enrolments')}
                    {renderRow('Indigenous %', school.Indigenous_pct, 'Percentage of Aboriginal and/or Torres Strait Islander students')}
                    {renderRow('LBOTE %', school.LBOTE_pct, 'Language Background Other Than English')}
                    {renderRow('Selective School', school.Selective_school)}
                    {renderRow('Opportunity Class', school.Opportunity_class)}
                    {renderRow('School Specialty Type', school.School_specialty_type)}
                    {renderRow('Support Classes', school.Support_classes)}
                    {renderRow('Preschool', school.Preschool_ind)}
                    {renderRow('Distance Education', school.Distance_education)}
                    {renderRow('Intensive English Centre', school.Intensive_english_centre)}
                    {renderRow('Late Opening School', school.Late_opening_school)}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Administrative Information</h4>
                  <div className="space-y-0">
                    {renderRow('School Code', school.School_code)}
                    {renderRow('AgeID', school.AgeID, 'Unique age identifier')}
                    {renderRow('Operational Directorate', school.Operational_directorate)}
                    {renderRow('Principal Network', school.Principal_network)}
                    {renderRow('LGA', school.LGA, 'Local Government Area')}
                    {renderRow('Electorate (from 2023)', school.electorate_from_2023)}
                    {renderRow('Federal Electorate (from 2025)', school.fed_electorate_from_2025)}
                    {renderRow('ASGS Remoteness', school.ASGS_remoteness, 'Australian Statistical Geography Standard')}
                    {renderRow('Date First Teacher', school.Date_1st_teacher)}
                    {renderRow('Date Extracted', school.Date_extracted)}
                  </div>
                </div>
              </div>
            </Section>

            <Section id="contact" title="Contact & Location Details" defaultOpen={false}>
              <div className="space-y-0">
                {renderRow('Full Address', `${school.Street || ''}${school.Street ? ', ' : ''}${school.Town_suburb || ''} ${school.Postcode || ''}`.trim())}
                {renderRow('Latitude', school.Latitude)}
                {renderRow('Longitude', school.Longitude)}
                {renderRow('Phone', school.Phone)}
                {renderRow('Email', school.School_Email)}
                {renderRow('Website', school.Website)}
                {renderRow('Fax', school.Fax)}
                {renderRow('Operational Directorate Office', school.Operational_directorate_office)}
                {renderRow('Directorate Office Phone', school.Operational_directorate_office_phone)}
                {renderRow('Directorate Office Address', school.Operational_directorate_office_address)}
              </div>
            </Section>
          </div>

          {/* School Images - Moved to bottom */}
          {school.images && school.images.length > 0 && (
            <div>
              <ImageGallery images={school.images} schoolName={school.School_name} />
            </div>
          )}

          {/* School Location Map - Moved to bottom */}
          <div>
            <MapSection
              lat={Number(school.Latitude)}
              lng={Number(school.Longitude)}
              name={school.School_name}
              suburb={`${school.Town_suburb} ${school.Postcode}`.trim()}
              level={school.Level_of_schooling}
              address={school.Street}
            />
          </div>
        </div>

        {/* Back to Search Link */}
        <div className="mt-12 text-center">
          <Link
            href="/search"
            className="inline-flex items-center px-6 py-3 bg-[#002664] text-white font-medium rounded-lg hover:bg-[#001a4d] transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search More Schools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailPage;

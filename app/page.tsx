'use client';

import { useState, useEffect, useMemo } from 'react';
import { School, SelectedSchools } from '@/types/school';
import SearchBar from '@/components/SearchBar';
import SchoolTable from '@/components/SchoolTable';
import SchoolComparison from '@/components/SchoolComparison';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import Filter from '@/components/Filter';
import LocalFinder from '@/components/LocalFinder';
import RadiusFilter from '@/components/RadiusFilter';
import { calculateDistance } from '@/utils/distance';

const API_URL = 'https://data.nsw.gov.au/data/dataset/78c10ea3-8d04-4c9c-b255-bbf8547e37e7/resource/b0026f18-2f23-4837-968c-959e5fb3311d/download/collections.json';

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [radius, setRadius] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedSchools, setSelectedSchools] = useState<SelectedSchools>({});
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match our School interface
        const transformedSchools: School[] = data.map((item: any) => ({
          School_name: item.School_name || '',
          Town_suburb: item.Town_suburb || '',
          Postcode: item.Postcode || '',
          Phone: item.Phone || '',
          School_Email: item.School_Email || '',
          Website: item.Website || '',
          Level_of_schooling: item.Level_of_schooling || '',
          Latitude: parseFloat(item.Latitude) || 0,
          Longitude: parseFloat(item.Longitude) || 0,
          Street: item.Street || '',
          School_code: item.School_code || '',
          AgeID: item.AgeID || '',
          Fax: item.Fax || '',
          latest_year_enrolment_FTE: item.latest_year_enrolment_FTE || '',
          Indigenous_pct: item.Indigenous_pct || '',
          LBOTE_pct: item.LBOTE_pct || '',
          ICSEA_value: item.ICSEA_value || '',
          Selective_school: item.Selective_school || '',
          Opportunity_class: item.Opportunity_class || '',
          School_specialty_type: item.School_specialty_type || '',
          School_subtype: item.School_subtype || '',
          Support_classes: item.Support_classes || '',
          Preschool_ind: item.Preschool_ind || '',
          Distance_education: item.Distance_education || '',
          Intensive_english_centre: item.Intensive_english_centre || '',
          School_gender: item.School_gender || '',
          Late_opening_school: item.Late_opening_school || '',
          Date_1st_teacher: item.Date_1st_teacher || '',
          LGA: item.LGA || '',
          electorate_from_2023: item.electorate_from_2023 || '',
          electorate_2015_2022: item.electorate_2015_2022 || '',
          fed_electorate_from_2025: item.fed_electorate_from_2025 || '',
          fed_electorate_2016_2024: item.fed_electorate_2016_2024 || '',
          Operational_directorate: item.Operational_directorate || '',
          Principal_network: item.Principal_network || '',
          Operational_directorate_office: item.Operational_directorate_office || '',
          Operational_directorate_office_phone: item.Operational_directorate_office_phone || '',
          Operational_directorate_office_address: item.Operational_directorate_office_address || '',
          FACS_district: item.FACS_district || '',
          Local_health_district: item.Local_health_district || '',
          AECG_region: item.AECG_region || '',
          ASGS_remoteness: item.ASGS_remoteness || '',
          "Assets unit": item["Assets unit"] || '',
          SA4: item.SA4 || '',
          FOEI_Value: item.FOEI_Value || '',
          Date_extracted: item.Date_extracted || '',
        }));
        
        setSchools(transformedSchools);
        // Store in localStorage for school details page
        localStorage.setItem('nsw-schools-data', JSON.stringify(transformedSchools));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schools data');
        console.error('Error fetching schools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    let filtered = schools;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(school => 
        school.School_name?.toLowerCase().includes(term) ||
        school.Town_suburb?.toLowerCase().includes(term)
      );
    }
    
    // Filter by school level
    if (schoolLevel) {
      filtered = filtered.filter(school => 
        school.Level_of_schooling === schoolLevel
      );
    }
    
    // Sort by distance if user location is set
    if (userLocation) {
      filtered = filtered
        .filter(school => school.Latitude && school.Longitude && school.Latitude !== 0 && school.Longitude !== 0)
        .map(school => ({
          ...school,
          distance: calculateDistance(userLocation.lat, userLocation.lon, school.Latitude, school.Longitude)
        }))
        .filter(school => radius === 0 || school.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .map(({ distance, ...school }) => school);
    }
    
    return filtered;
  }, [schools, searchTerm, schoolLevel, userLocation, radius]);

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSchoolLevelChange = (level: string) => {
    setSchoolLevel(level);
    setCurrentPage(1);
  };

  const handleLocationFound = (lat: number, lon: number) => {
    setUserLocation({ lat, lon });
    setCurrentPage(1);
  };

  const handleLocationClear = () => {
    setUserLocation(null);
    setRadius(0);
    setCurrentPage(1);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setCurrentPage(1);
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchools(prev => ({
      ...prev,
      [school.School_code]: school
    }));
  };

  const handleSchoolDeselect = (schoolCode: string) => {
    setSelectedSchools(prev => {
      const newSelection = { ...prev };
      delete newSelection[schoolCode];
      return newSelection;
    });
  };

  const handleCompareSchools = () => {
    if (Object.keys(selectedSchools).length >= 2) {
      setShowComparison(true);
    }
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  const handleClearSelection = () => {
    setSelectedSchools({});
  };

  const handleToggleComparisonMode = () => {
    if (!comparisonMode) {
      // First time opening - show instructions
      setShowInstructionModal(true);
    } else {
      // Closing mode - clear selection
      setComparisonMode(false);
      setSelectedSchools({});
    }
  };

  const handleStartComparison = () => {
    setShowInstructionModal(false);
    setComparisonMode(true);
  };

  const selectedCount = Object.keys(selectedSchools).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 lg:p-8 min-h-[70vh]">
          {/* Header Section */}
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="sr-only">
                <h2 className="text-2xl font-bold brand-primary mb-2">
                  Schools Directory
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-primary text-white">
                    {filteredSchools.length} of {schools.length} schools
                  </span>
                  {userLocation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-secondary text-white">
                      Sorted by distance
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* School Comparison Tool Card */}
            <div className="mb-6 lg:mb-8">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-[#002664]/10 overflow-hidden">
                <div className="p-6 lg:p-8">
                  {/* Header Section */}
                  <div className="flex items-start gap-5 mb-6">
                    {/* Enhanced Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#002664] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Title and Description */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#002664] flex items-center gap-2 mb-2">
                        School Comparison Tool
                      </h2>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Compare NSW public schools by academic performance, demographics, and location to find the best fit for your family.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    {!comparisonMode ? (
                      <button
                        onClick={handleToggleComparisonMode}
                        className="bg-[#002664] hover:bg-[#001a4d] text-white px-7 py-3.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 group"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Compare Schools</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                        {selectedCount > 0 && (
                          <div className="flex items-center space-x-3 bg-[#002664]/5 border border-[#002664]/20 px-4 py-2 rounded-lg">
                            <svg className="w-5 h-5 text-[#002664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-[#002664]">
                              {selectedCount} of 3 schools selected
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 ml-auto">
                          {selectedCount >= 2 && (
                            <button
                              onClick={handleCompareSchools}
                              className="bg-brand-secondary hover:bg-[#b3122e] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span>Compare Schools</span>
                            </button>
                          )}
                          {selectedCount > 0 && (
                            <button
                              onClick={handleClearSelection}
                              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                              title="Clear selection"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={handleToggleComparisonMode}
                            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-sm font-medium"
                          >
                            Exit Comparison Mode
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-4 lg:mb-6">
              {/* Search and Filter Panel */}
              <div className="bg-gray-50 rounded-lg p-4 lg:p-6 border border-gray-200">
                <h3 className="text-lg font-semibold brand-primary mb-4">Search & Filter</h3>
                <SearchBar 
                  searchTerm={searchTerm} 
                  onSearchChange={handleSearchChange} 
                />
                <Filter 
                  schoolLevel={schoolLevel}
                  onSchoolLevelChange={handleSchoolLevelChange}
                />
              </div>
              
              {/* Local Finder Panel */}
              <div className="bg-white rounded-lg p-4 lg:p-6 border-2 border-brand-primary">
                <LocalFinder 
                  onLocationFound={handleLocationFound}
                  onLocationClear={handleLocationClear}
                  isActive={!!userLocation}
                />
                <RadiusFilter 
                  radius={radius}
                  onRadiusChange={handleRadiusChange}
                  isActive={!!userLocation}
                />
              </div>
            </div>
          </div>
          
          <div className="-mx-4 sm:mx-0">
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-100">
              <SchoolTable 
                schools={filteredSchools}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                userLocation={userLocation || undefined}
                selectedSchools={selectedSchools}
                onSchoolSelect={handleSchoolSelect}
                onSchoolDeselect={handleSchoolDeselect}
                showComparison={comparisonMode}
              />
            </div>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* School Comparison Modal */}
      {showComparison && (
        <SchoolComparison
          selectedSchools={selectedSchools}
          onClose={handleCloseComparison}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Comparison Instructions Modal */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowInstructionModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-[#002664] text-white px-6 py-5 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Getting Started</h3>
                </div>
                <button
                  onClick={() => setShowInstructionModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Select up to 3 schools from the list below to compare side-by-side.
              </p>

              {/* Feature list */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#002664]/10 border border-[#002664]/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-[#002664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Compare Performance</h4>
                    <p className="text-sm text-gray-600">View academic results, ICSEA values, and enrollment data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#002664]/10 border border-[#002664]/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-[#002664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Analyze Demographics</h4>
                    <p className="text-sm text-gray-600">Compare student demographics and diversity metrics</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#002664]/10 border border-[#002664]/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-[#002664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Visual Charts</h4>
                    <p className="text-sm text-gray-600">View interactive radar and bar charts for easy comparison</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() => setShowInstructionModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartComparison}
                className="bg-[#002664] hover:bg-[#001a4d] text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

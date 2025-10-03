'use client';

import { useState, useEffect, useMemo } from 'react';
import { School } from '@/types/school';
import SearchBar from '@/components/SearchBar';
import SchoolTable from '@/components/SchoolTable';
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
    </div>
  );
}

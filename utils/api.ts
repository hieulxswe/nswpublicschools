/**
 * API utilities for fetching school data from NSW Public Schools and MySchool APIs
 */

import { School } from '@/types/school';
import { generateSlug, findSchoolBySlug, generateUniqueSlugs } from './slug';

// NSW Public Schools API endpoints
const NSW_SCHOOLS_API = 'https://data.nsw.gov.au/data/dataset/78c10ea3-8d04-4c9c-b255-bbf8547e37e7/resource/b0026f18-2f23-4837-968c-959e5fb3311d/download/collections.json';

// MySchool API endpoints (these are examples - actual endpoints may vary)
const MYSCHOOL_BASE_URL = 'https://www.myschool.edu.au/api/school';
const MYSCHOOL_IMAGES_BASE = 'https://www.myschool.edu.au/schools';

/**
 * Fetch all schools from NSW Public Schools API
 */
export async function fetchAllSchools(): Promise<School[]> {
  try {
    const response = await fetch(NSW_SCHOOLS_API, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NSW-Public-Schools-Finder/1.0'
      },
      cache: 'no-store' // Disable caching due to large dataset size
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our School interface
    const schools: School[] = data.map((item: any) => ({
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

    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw new Error('Failed to fetch school data');
  }
}

/**
 * Fetch a specific school by slug
 */
export async function fetchSchoolBySlug(slug: string): Promise<School | null> {
  try {
    const schools = await fetchAllSchools();
    const school = findSchoolBySlug(schools, slug);
    return school;
  } catch (error) {
    console.error('Error fetching school by slug:', error);
    throw new Error('Failed to fetch school data');
  }
}

/**
 * Generate static paths for all schools (for ISR/SSG)
 */
export async function generateSchoolPaths(): Promise<{ slug: string }[]> {
  try {
    const schools = await fetchAllSchools();
    const slugMap = generateUniqueSlugs(schools);
    return Array.from(slugMap.keys()).map(slug => ({ slug }));
  } catch (error) {
    console.error('Error generating school paths:', error);
    return [];
  }
}

/**
 * Extended school data interface for additional MySchool data
 */
export interface ExtendedSchoolData extends School {
  images?: SchoolImage[];
  programs?: SchoolProgram[];
  extracurricular?: ExtracurricularActivity[];
  rankings?: SchoolRanking[];
}

export interface SchoolImage {
  url: string;
  alt: string;
  type: 'logo' | 'building' | 'grounds' | 'activities';
  caption?: string;
}

export interface SchoolProgram {
  name: string;
  description: string;
  type: 'academic' | 'sports' | 'arts' | 'technology' | 'special';
  level?: string;
}

export interface ExtracurricularActivity {
  name: string;
  description: string;
  category: 'sports' | 'arts' | 'academic' | 'community' | 'leadership';
  age_group?: string;
}

export interface SchoolRanking {
  year: number;
  metric: string;
  value: number;
  rank?: number;
  total?: number;
}

/**
 * Fetch additional school data from MySchool (placeholder implementation)
 * Note: MySchool API access may require authentication or have rate limits
 */
export async function fetchMySchoolData(schoolCode: string): Promise<{
  images: SchoolImage[];
  programs: SchoolProgram[];
  extracurricular: ExtracurricularActivity[];
  rankings: SchoolRanking[];
}> {
  // This is a placeholder implementation
  // In a real scenario, you would integrate with the actual MySchool API
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock data for demonstration
    // In production, replace with actual API calls
    return {
      images: [
        {
          url: '/api/placeholder/400/300',
          alt: 'School building',
          type: 'building',
          caption: 'Main school building'
        }
      ],
      programs: [
        {
          name: 'Gifted and Talented Program',
          description: 'Specialized program for academically gifted students',
          type: 'academic',
          level: 'Years 5-6'
        },
        {
          name: 'Music Program',
          description: 'Comprehensive music education including instrumental lessons',
          type: 'arts'
        }
      ],
      extracurricular: [
        {
          name: 'Debating Team',
          description: 'Competitive debating for students in Years 5-6',
          category: 'academic',
          age_group: 'Years 5-6'
        },
        {
          name: 'School Choir',
          description: 'Choir for students interested in vocal performance',
          category: 'arts'
        },
        {
          name: 'Sports Teams',
          description: 'Various sporting teams including soccer, basketball, and athletics',
          category: 'sports'
        }
      ],
      rankings: [
        {
          year: 2023,
          metric: 'NAPLAN Reading',
          value: 85,
          rank: 150,
          total: 1000
        },
        {
          year: 2023,
          metric: 'NAPLAN Writing',
          value: 82,
          rank: 180,
          total: 1000
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching MySchool data:', error);
    // Return empty data on error
    return {
      images: [],
      programs: [],
      extracurricular: [],
      rankings: []
    };
  }
}

/**
 * Fetch complete school data including MySchool data
 */
export async function fetchCompleteSchoolData(slug: string): Promise<ExtendedSchoolData | null> {
  try {
    const school = await fetchSchoolBySlug(slug);
    if (!school) {
      return null;
    }

    // Fetch additional data from MySchool
    const additionalData = await fetchMySchoolData(school.School_code);

    return {
      ...school,
      ...additionalData
    };
  } catch (error) {
    console.error('Error fetching complete school data:', error);
    throw new Error('Failed to fetch complete school data');
  }
}

/**
 * Cache management utilities
 */
export class SchoolDataCache {
  private static cache = new Map<string, { data: School[]; timestamp: number }>();
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static async getSchools(): Promise<School[]> {
    const cached = this.cache.get('all_schools');
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    const schools = await fetchAllSchools();
    this.cache.set('all_schools', { data: schools, timestamp: now });
    return schools;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

export interface School {
  School_name: string;
  Town_suburb: string;
  Postcode: string;
  Phone: string;
  School_Email: string;
  Website: string;
  Level_of_schooling: string;
  Latitude: number;
  Longitude: number;
  Street: string;
  School_code: string;
  AgeID: string;
  Fax: string;
  latest_year_enrolment_FTE: string;
  Indigenous_pct: string;
  LBOTE_pct: string;
  ICSEA_value: string;
  Selective_school: string;
  Opportunity_class: string;
  School_specialty_type: string;
  School_subtype: string;
  Support_classes: string;
  Preschool_ind: string;
  Distance_education: string;
  Intensive_english_centre: string;
  School_gender: string;
  Late_opening_school: string;
  Date_1st_teacher: string;
  LGA: string;
  electorate_from_2023: string;
  electorate_2015_2022: string;
  fed_electorate_from_2025: string;
  fed_electorate_2016_2024: string;
  Operational_directorate: string;
  Principal_network: string;
  Operational_directorate_office: string;
  Operational_directorate_office_phone: string;
  Operational_directorate_office_address: string;
  FACS_district: string;
  Local_health_district: string;
  AECG_region: string;
  ASGS_remoteness: string;
  "Assets unit": string;
  SA4: string;
  FOEI_Value: string;
  Date_extracted: string;
  [key: string]: any; // For any additional fields
}

export interface SchoolData {
  data: School[];
  total: number;
}

// Types for school comparison
export interface ComparisonCriteria {
  key: keyof School;
  label: string;
  format?: (value: any) => string;
  numeric?: boolean;
}

export interface SchoolComparisonData {
  school: School;
  criteria: {
    [key: string]: any;
  };
}

export interface ComparisonViewMode {
  type: 'table' | 'chart';
}

export interface SelectedSchools {
  [schoolCode: string]: School;
}

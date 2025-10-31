'use client';

import React, { useState, useMemo } from 'react';
import { School, ComparisonCriteria, SelectedSchools } from '@/types/school';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface SchoolComparisonProps {
  selectedSchools: SelectedSchools;
  onClose: () => void;
  onClearSelection: () => void;
}

// Define comparison criteria with formatting functions
const comparisonCriteria: ComparisonCriteria[] = [
  {
    key: 'latest_year_enrolment_FTE',
    label: 'Enrolment (FTE)',
    format: (value: string) => value ? parseInt(value).toLocaleString() : 'N/A',
    numeric: true
  },
  {
    key: 'ICSEA_value',
    label: 'ICSEA Value',
    format: (value: string) => value || 'N/A',
    numeric: true
  },
  {
    key: 'LBOTE_pct',
    label: 'LBOTE %',
    format: (value: string) => value ? `${value}%` : 'N/A',
    numeric: true
  },
  {
    key: 'Indigenous_pct',
    label: 'Indigenous %',
    format: (value: string) => value ? `${value}%` : 'N/A',
    numeric: true
  },
  {
    key: 'Level_of_schooling',
    label: 'School Level',
    format: (value: string) => value || 'N/A',
    numeric: false
  },
  {
    key: 'School_specialty_type',
    label: 'Specialty Type',
    format: (value: string) => value || 'N/A',
    numeric: false
  }
];

export default function SchoolComparison({ selectedSchools, onClose, onClearSelection }: SchoolComparisonProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const selectedSchoolsArray = useMemo(() => {
    return Object.values(selectedSchools);
  }, [selectedSchools]);

  // Prepare data for radar chart (only numeric criteria)
  const radarData = useMemo(() => {
    const numericCriteria = comparisonCriteria.filter(c => c.numeric);
    
    return numericCriteria.map(criteria => {
      const dataPoint: any = { criteria: criteria.label };
      
      selectedSchoolsArray.forEach(school => {
        const value = school[criteria.key] as string;
        let numericValue = 0;
        
        if (value) {
          if (criteria.key === 'latest_year_enrolment_FTE') {
            numericValue = parseInt(value) || 0;
          } else if (criteria.key === 'ICSEA_value') {
            numericValue = parseInt(value) || 0;
          } else if (criteria.key === 'LBOTE_pct' || criteria.key === 'Indigenous_pct') {
            numericValue = parseFloat(value) || 0;
          }
        }
        
        dataPoint[school.School_name] = numericValue;
      });
      
      return dataPoint;
    });
  }, [selectedSchoolsArray]);

  // Prepare data for bar chart
  const barData = useMemo(() => {
    return selectedSchoolsArray.map(school => ({
      name: school.School_name.length > 15 
        ? school.School_name.substring(0, 15) + '...' 
        : school.School_name,
      fullName: school.School_name,
      enrolment: parseInt(school.latest_year_enrolment_FTE) || 0,
      icsea: parseInt(school.ICSEA_value) || 0,
      lbote: parseFloat(school.LBOTE_pct) || 0,
      indigenous: parseFloat(school.Indigenous_pct) || 0
    }));
  }, [selectedSchoolsArray]);

  const handleClearAndClose = () => {
    onClearSelection();
    onClose();
  };

  if (selectedSchoolsArray.length === 0) {
    return null;
  }

  const colors = ['#002664', '#d7153a', '#28a745', '#ffc107', '#17a2b8'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">School Comparison Tool</h2>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Compare NSW schools by performance, demographics, and location to find the best fit for your needs
            </p>
            <p className="text-sm opacity-90 mt-2">
              Comparing {selectedSchoolsArray.length} school{selectedSchoolsArray.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-brand-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-white text-brand-primary' 
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Charts
              </button>
            </div>
            <button
              onClick={handleClearAndClose}
              className="text-white hover:text-gray-200 transition-colors"
              title="Close comparison"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Criteria
                    </th>
                    {selectedSchoolsArray.map((school, index) => (
                      <th key={school.School_code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="max-w-32 truncate" title={school.School_name}>
                            {school.School_name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonCriteria.map((criteria) => (
                    <tr key={criteria.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                        {criteria.label}
                      </td>
                      {selectedSchoolsArray.map((school) => {
                        const value = school[criteria.key] as string;
                        const formattedValue = criteria.format ? criteria.format(value) : value || 'N/A';
                        
                        return (
                          <td key={school.School_code} className="px-6 py-4 text-sm text-gray-700">
                            <span className={`${
                              criteria.numeric && value ? 'font-mono' : ''
                            }`}>
                              {formattedValue}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Radar Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="criteria" />
                      <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                      {selectedSchoolsArray.map((school, index) => (
                        <Radar
                          key={school.School_code}
                          name={school.School_name}
                          dataKey={school.School_name}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolment & ICSEA</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'enrolment') return [value.toLocaleString(), 'Enrolment'];
                            if (name === 'icsea') return [value, 'ICSEA Value'];
                            return [value, name];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="enrolment" fill="#002664" name="Enrolment" />
                        <Bar yAxisId="right" dataKey="icsea" fill="#d7153a" name="ICSEA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Demographics (%)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'lbote') return [`${value}%`, 'LBOTE %'];
                            if (name === 'indigenous') return [`${value}%`, 'Indigenous %'];
                            return [value, name];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="lbote" fill="#28a745" name="LBOTE %" />
                        <Bar dataKey="indigenous" fill="#ffc107" name="Indigenous %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Selected Schools:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedSchoolsArray.map((school, index) => (
                <span 
                  key={school.School_code}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: colors[index % colors.length] }}
                >
                  {school.School_name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleClearAndClose}
            className="btn-primary"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { School } from '@/types/school';

const COLORS = ['#002664', '#d7153a'];

interface SchoolStatsChartProps {
  school: School;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}: ${payload[0].value} students`}</p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum, item) => sum + item.payload.value, 0);
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">
          {data.name}: {data.value}
        </p>
        {total > 0 && (
          <p className="text-sm text-gray-600">
            {((data.value / total) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SchoolStatsChart: React.FC<SchoolStatsChartProps> = ({ school }) => {
  // Process enrollment data - since API only provides latest year, show current enrollment
  const getEnrollmentData = () => {
    const currentEnrollment = parseFloat(school.latest_year_enrolment_FTE) || 0;
    
    if (currentEnrollment === 0) {
      return [{ year: 'No Data Available', students: 0 }];
    }
    
    // Show current enrollment as a single bar since historical data isn't available
    return [{ year: 'Current Enrollment', students: Math.round(currentEnrollment) }];
  };

  // Process demographic data for pie chart
  const getDemographicData = () => {
    const data = [];
    
    // School gender type
    const schoolGender = school.School_gender?.toLowerCase() || '';
    if (schoolGender.includes('boys') || schoolGender.includes('male')) {
      data.push({ name: 'Male Students', value: 100, color: '#002664' });
    } else if (schoolGender.includes('girls') || schoolGender.includes('female')) {
      data.push({ name: 'Female Students', value: 100, color: '#d7153a' });
    } else {
      data.push({ name: 'Co-ed School', value: 100, color: '#002664' });
    }
    
    // Add Indigenous percentage if available
    const indigenousPct = parseFloat(school.Indigenous_pct) || 0;
    if (indigenousPct > 0) {
      data.push({ 
        name: 'Indigenous Students', 
        value: indigenousPct, 
        color: '#10b981' 
      });
    }
    
    // Add LBOTE percentage if available
    const lbotePct = parseFloat(school.LBOTE_pct) || 0;
    if (lbotePct > 0) {
      data.push({ 
        name: 'LBOTE Students', 
        value: lbotePct, 
        color: '#f59e0b' 
      });
    }
    
    return data;
  };

  const enrollmentData = getEnrollmentData();
  const demographicData = getDemographicData();
  const currentEnrollment = parseFloat(school.latest_year_enrolment_FTE) || 0;
  const indigenousPct = parseFloat(school.Indigenous_pct) || 0;
  const lbotePct = parseFloat(school.LBOTE_pct) || 0;
  
  // Check if we have any meaningful data to display
  const hasEnrollmentData = currentEnrollment > 0;
  const hasDemographicData = demographicData.length > 0;
  const hasAnyData = hasEnrollmentData || hasDemographicData || school.School_gender;
  
  // If no data at all, show a placeholder
  if (!hasAnyData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#002664]">School Statistics</h3>
          <p className="text-sm text-gray-600 mt-1">Enrollment trends and demographics</p>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Statistical Data Available</h4>
          <p className="text-sm text-gray-600">
            This school doesn't have enrollment or demographic data available in the current dataset.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-[#002664]">School Statistics</h3>
        <p className="text-sm text-gray-600 mt-1">Enrollment trends and demographics</p>
      </div>
      
      <div className="p-6">
        <div className={`grid gap-8 ${hasEnrollmentData && hasDemographicData ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Student Enrollment - Bar Chart */}
          {hasEnrollmentData && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Student Enrollment
                </h4>
                <p className="text-sm text-gray-600">
                  Latest year full-time equivalent enrollment
                </p>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enrollmentData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: '#d1d5db' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      domain={[0, 'dataMax + 50']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="students" 
                      fill="#002664"
                      radius={[4, 4, 0, 0]}
                      stroke="#002664"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Student Demographics - Pie Chart */}
          {hasDemographicData && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Student Demographics
                </h4>
                <p className="text-sm text-gray-600">
                  School type and student population breakdown
                </p>
              </div>
              
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Stats Summary */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002664]">
                {currentEnrollment > 0 ? Math.round(currentEnrollment) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Total Enrollment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002664]">
                {school.School_gender || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">School Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002664]">
                {indigenousPct > 0 ? `${indigenousPct}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Indigenous Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002664]">
                {lbotePct > 0 ? `${lbotePct}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">LBOTE Students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolStatsChart;

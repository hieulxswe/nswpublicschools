import React from 'react';

interface FilterProps {
  schoolLevel: string;
  onSchoolLevelChange: (level: string) => void;
}

export default function Filter({ schoolLevel, onSchoolLevelChange }: FilterProps) {
  const schoolLevels = [
    { value: '', label: 'All Schools' },
    { value: 'Primary School', label: 'Primary School' },
    { value: 'High School', label: 'High School' },
    { value: 'Secondary School', label: 'Secondary School' },
    { value: 'Other School', label: 'Other School' }
  ];

  return (
    <div className="mb-6">
      <label htmlFor="school-level" className="block text-sm font-medium brand-primary mb-2">
        School Level
      </label>
      <select
        id="school-level"
        value={schoolLevel}
        onChange={(e) => onSchoolLevelChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002664] focus:border-transparent transition-all duration-200 bg-white"
      >
        {schoolLevels.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
  );
}

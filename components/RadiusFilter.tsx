import React from 'react';

interface RadiusFilterProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  isActive: boolean;
}

export default function RadiusFilter({ radius, onRadiusChange, isActive }: RadiusFilterProps) {
  const radiusOptions = [
    { value: 0, label: 'All distances' },
    { value: 5, label: 'Within 5km' },
    { value: 10, label: 'Within 10km' },
    { value: 20, label: 'Within 20km' },
    { value: 50, label: 'Within 50km' },
  ];

  if (!isActive) return null;

  return (
    <div className="mb-6">
      <label htmlFor="radius-filter" className="block text-sm font-medium brand-primary mb-2">
        Distance Filter
      </label>
      <select
        id="radius-filter"
        value={radius}
        onChange={(e) => onRadiusChange(Number(e.target.value))}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002664] focus:border-transparent transition-all duration-200 bg-white"
      >
        {radiusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {radius > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Showing schools within {radius}km of your location
        </p>
      )}
    </div>
  );
}

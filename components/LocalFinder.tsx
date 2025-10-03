import React, { useState, useEffect, useRef } from 'react';
import { getAddressSuggestions, geocodeAddress, AddressSuggestion } from '@/utils/geocoding';
import { getCurrentLocation, isGeolocationSupported } from '@/utils/geolocation';

interface LocalFinderProps {
  onLocationFound: (lat: number, lon: number) => void;
  onLocationClear: () => void;
  isActive: boolean;
}

export default function LocalFinder({ onLocationFound, onLocationClear, isActive }: LocalFinderProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [locationMethod, setLocationMethod] = useState<'auto' | 'manual' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced address suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (address.trim().length >= 3) {
        const suggestions = await getAddressSuggestions(address);
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [address]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setSelectedSuggestion(null);
    setError('');
  };

  const handleGetCurrentLocation = async () => {
    if (!isGeolocationSupported()) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      setLocationMethod('auto');
      onLocationFound(location.lat, location.lon);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLocationMethod(null);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.displayName);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    setError('');
  };

  const handleFindSchools = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setError('');

    try {
      let result;
      
      if (selectedSuggestion) {
        // Use the selected suggestion's coordinates
        result = { lat: selectedSuggestion.lat, lon: selectedSuggestion.lon };
      } else {
        // Geocode the entered address
        result = await geocodeAddress(address);
      }
      
      if (result) {
        setLocationMethod('manual');
        onLocationFound(result.lat, result.lon);
        setError('');
      } else {
        setError('Address not found. Please try a different address.');
      }
    } catch (err) {
      setError('Failed to find address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleClear = () => {
    setAddress('');
    setSelectedSuggestion(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
    setLocationMethod(null);
    onLocationClear();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold brand-primary mb-3">
        Local School Finder
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Find schools near your location
      </p>
      
      {/* Automatic Location Button */}
      <div className="mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="w-full px-4 py-3 bg-brand-primary hover:bg-[#001a4d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isGettingLocation ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting your location...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Current Location
            </span>
          )}
        </button>
      </div>
      
      {/* Divider */}
      <div className="flex items-center mb-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      
      {/* Manual Address Input */}
      <div className="relative">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your address (e.g., 123 Main St, Sydney NSW 2000)"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002664] focus:border-transparent transition-all duration-200"
              disabled={isGeocoding}
              autoComplete="off"
            />
            
            {/* Address Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.address.road} {suggestion.address.house_number}
                    </div>
                    <div className="text-xs text-gray-600">
                      {suggestion.address.suburb}, {suggestion.address.state} {suggestion.address.postcode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleFindSchools}
            disabled={isGeocoding || !address.trim()}
            className="px-6 py-3 bg-brand-primary hover:bg-[#001a4d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            {isGeocoding ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding...
              </span>
            ) : (
              'Find Schools'
            )}
          </button>
          {isActive && (
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-brand-secondary hover:bg-[#b81232] text-white font-medium rounded-lg transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            >
              Clear
            </button>
          )}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm mb-2">
            {error}
          </div>
        )}
        
        {isActive && (
          <div className="text-green-600 text-sm">
            ✅ Location found! Showing schools sorted by distance.
            {locationMethod === 'auto' && (
              <span className="block text-xs text-gray-500 mt-1">
                Using your current location
              </span>
            )}
            {locationMethod === 'manual' && (
              <span className="block text-xs text-gray-500 mt-1">
                Using entered address
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

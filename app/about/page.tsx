'use client';

import React, { useState, useEffect } from 'react';
import { getLastUpdatedDate } from '@/utils/lastUpdated';

export default function AboutPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchLastUpdate = async () => {
      const date = await getLastUpdatedDate();
      setLastUpdated(date);
    };

    fetchLastUpdate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold brand-primary mb-4">About NSW Public Schools Finder</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and explore NSW public schools with our comprehensive search platform. 
            Find schools near you, compare details, and make informed decisions about your child's education.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Features */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold brand-primary mb-6">Key Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Local School Finder</h3>
                  <p className="text-gray-600">Use your current location or enter an address to find schools nearby</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced Filtering</h3>
                  <p className="text-gray-600">Filter by school level, name, and distance from your location</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Detailed Information</h3>
                  <p className="text-gray-600">Access comprehensive school details including contact info, demographics, and academic data</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Responsive</h3>
                  <p className="text-gray-600">Optimized for all devices with clean, modern design</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold brand-primary mb-6">Data Source</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Our school data is sourced directly from the NSW Department of Education's official dataset, 
                ensuring accuracy and up-to-date information.
              </p>
              {lastUpdated && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Last updated:</strong> {lastUpdated}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">NSW Public Schools Dataset</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Comprehensive information about all NSW public schools including:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contact details and locations</li>
                  <li>• School levels and types</li>
                  <li>• Academic performance data</li>
                  <li>• Demographics and enrollment</li>
                  <li>• Administrative information</li>
                </ul>
              </div>
             
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold brand-primary mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Set Your Location</h3>
              <p className="text-gray-600">Use automatic location detection or enter your address manually</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply Filters</h3>
              <p className="text-gray-600">Filter by school level, name, and distance to find relevant schools</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Explore Details</h3>
              <p className="text-gray-600">Click on schools to view comprehensive information and contact details</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold brand-primary mb-4">Ready to Find Your School?</h2>
          <p className="text-gray-600 mb-6">Start exploring NSW public schools in your area today</p>
          <a
            href="/"
            className="btn-primary inline-block"
          >
            Start Searching
          </a>
        </div>
      </div>
    </div>
  );
}

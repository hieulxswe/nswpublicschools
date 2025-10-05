'use client';

import React from 'react';

export default function InfoBar() {
  return (
    <div className="bg-gradient-to-r from-red-100 via-red-50 to-white shadow-sm border-b border-red-100 infobar-fade-in">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-center items-center text-sm text-red-800">
          <p>
            Data sourced from{' '}
            <a 
              href="https://education.nsw.gov.au/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-700 hover:text-red-900 hover:underline transition-colors duration-200 font-medium"
            >
              NSW Department of Education
            </a>
            {' | '}
            Last updated: 3 October 2025 at 10:00 am AEST
          </p>
        </div>
      </div>
    </div>
  );
}

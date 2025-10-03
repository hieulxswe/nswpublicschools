'use client';

import React, { useState, useEffect } from 'react';
import { getLastUpdatedDate } from '@/utils/lastUpdated';

export default function Footer() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchLastUpdate = async () => {
      const date = await getLastUpdatedDate();
      setLastUpdated(date);
    };

    fetchLastUpdate();
  }, []);

  return (
    <footer className="bg-gradient-to-b from-[#002664] to-[#001f4d] text-white border-t border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="text-center">
          {/* Single Line - Desktop */}
          <div className="hidden sm:block">
            <p className="text-sm text-white">
              Thank you for visiting! Data last updated: {lastUpdated || 'Loading...'}
              <span className="mx-2 text-[#d1d5db]">•</span>
              <span className="text-[#d1d5db] text-xs">
                Source: NSW Department of Education – NSW Public Schools official dataset
              </span>
            </p>
          </div>
          
          {/* Two Lines - Mobile */}
          <div className="block sm:hidden space-y-1">
            <p className="text-sm text-white">
              Thank you for visiting! Data last updated: {lastUpdated || 'Loading...'}
            </p>
            <p className="text-xs text-[#d1d5db]">
              Source: NSW Department of Education – NSW Public Schools official dataset
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

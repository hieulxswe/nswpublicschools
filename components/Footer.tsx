'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#002664] text-gray-200 text-center text-sm py-4 border-t border-[#003182]">
      <p>
        © {new Date().getFullYear()} NSW Public Schools Finder — All rights reserved.
      </p>
    </footer>
  );
}

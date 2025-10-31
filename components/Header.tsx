'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    // { name: 'Contact', href: '/contact' }, // TEMPORARILY HIDDEN
    { name: 'FAQ', href: '/faq' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#002664] text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title - TEMPORARILY HIDDEN LOGO */}
            <div className="flex items-center space-x-3">
              {/* LOGO TEMPORARILY HIDDEN */}
              {/* 
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#002664]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              */}
              <div>
                <h1 className="text-lg font-bold">NSW Public Schools Finder</h1>
                <p className="text-xs text-blue-100 hidden sm:block">Find your local schools</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-white font-bold'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {item.name}
                  {/* Active indicator - always visible for active page */}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7153a]"></div>
                  )}
                  {/* Hover underline - only for non-active pages */}
                  {!isActive(item.href) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7153a] opacity-0 hover:opacity-100 transition-all duration-200"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Slide down */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-blue-700 bg-blue-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative block px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-[#d7153a] text-white font-bold'
                        : 'text-white hover:text-blue-100 hover:bg-blue-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                    {/* Active indicator for mobile */}
                    {isActive(item.href) && (
                      <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-white"></div>
                    )}
                    {/* Hover underline for mobile - only for non-active pages */}
                    {!isActive(item.href) && (
                      <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-white opacity-0 hover:opacity-100 transition-all duration-200"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

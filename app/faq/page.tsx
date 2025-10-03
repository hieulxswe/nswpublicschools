'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs: FAQItem[] = [
    {
      question: "How do I find schools near my location?",
      answer: "Use the 'Use My Current Location' button to automatically detect your location, or enter your address manually in the search box. The system will show you schools sorted by distance from your location."
    },
    {
      question: "Can I filter schools by distance?",
      answer: "Yes! Once you set your location, you can use the radius filter to show only schools within 5km, 10km, 20km, 50km, or all distances. This helps you focus on schools that are realistically accessible."
    },
    {
      question: "What information is available for each school?",
      answer: "Each school listing includes contact details (phone, email, website), location information, school level, academic data (ICSEA value, enrollment), demographics, and administrative information. Click on any school name to see comprehensive details."
    },
    {
      question: "How accurate is the school data?",
      answer: "Our data comes directly from the NSW Department of Education's official dataset, ensuring accuracy and up-to-date information. The data is regularly updated to reflect the latest school information."
    },
    {
      question: "Can I search for specific types of schools?",
      answer: "Yes! You can filter by school level (Primary School, High School, Secondary School) and search by school name. You can also combine these filters with location-based searches for more targeted results."
    },
    {
      question: "Is my location data stored or shared?",
      answer: "No, your location data is only used locally in your browser to calculate distances to schools. We don't store, share, or transmit your location information to any servers."
    },
    {
      question: "What if I can't find a school I'm looking for?",
      answer: "If you can't find a specific school, try searching with different terms or check if the school might be listed under a different name. You can also contact the NSW Department of Education directly for assistance."
    },
    {
      question: "Can I use this on my mobile device?",
      answer: "Absolutely! The website is fully responsive and optimized for mobile devices. You can use location services on your phone to find nearby schools while you're out and about."
    },
    {
      question: "How often is the school data updated?",
      answer: "The school data is sourced from the official NSW Department of Education dataset, which is updated regularly. Our website fetches the latest data each time you visit, ensuring you always see current information."
    },
    {
      question: "Can I get more detailed information about a school?",
      answer: "Yes! Click on any school name in the search results to view a detailed page with comprehensive information including academic performance, demographics, contact details, and administrative information."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold brand-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using the NSW Public Schools Finder. 
            Can't find what you're looking for? Contact us for more help.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-brand-primary transition-transform duration-200 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA - TEMPORARILY HIDDEN */}
        {/* 
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold brand-primary mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? We're here to help! 
              Get in touch with us for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-primary">
                Contact Us
              </a>
              <a href="/" className="btn-secondary">
                Start Searching
              </a>
            </div>
          </div>
        </div>
        */}
    </div>
  );
}

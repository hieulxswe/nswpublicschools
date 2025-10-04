/**
 * Utility functions for generating and working with school slugs
 */

/**
 * Generate a URL-friendly slug from a school name
 * @param schoolName - The school name to convert to slug
 * @param schoolCode - Optional school code to ensure uniqueness
 * @returns A URL-friendly slug
 */
export function generateSlug(schoolName: string, schoolCode?: string): string {
  if (!schoolName) return '';
  
  let slug = schoolName
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9\-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // If school code is provided, append it to ensure uniqueness
  if (schoolCode && schoolCode.trim()) {
    slug += `-${schoolCode.toLowerCase().trim()}`;
  }
  
  return slug;
}

/**
 * Generate unique slugs for all schools, handling conflicts by appending school codes
 * @param schools - Array of school objects
 * @returns Map of slugs to school objects
 */
export function generateUniqueSlugs(schools: any[]): Map<string, any> {
  const slugMap = new Map<string, any>();
  const slugCounts = new Map<string, number>();
  
  // First pass: count occurrences of each base slug
  schools.forEach(school => {
    const baseSlug = generateSlug(school.School_name);
    slugCounts.set(baseSlug, (slugCounts.get(baseSlug) || 0) + 1);
  });
  
  // Second pass: generate unique slugs
  schools.forEach(school => {
    const baseSlug = generateSlug(school.School_name);
    const count = slugCounts.get(baseSlug) || 0;
    
    let uniqueSlug: string;
    if (count === 1) {
      // No conflict, use base slug
      uniqueSlug = baseSlug;
    } else {
      // Conflict exists, append school code
      uniqueSlug = generateSlug(school.School_name, school.School_code);
    }
    
    slugMap.set(uniqueSlug, school);
  });
  
  return slugMap;
}

/**
 * Find a school by its slug from a list of schools
 * @param schools - Array of school objects
 * @param slug - The slug to search for
 * @returns The matching school or null if not found
 */
export function findSchoolBySlug(schools: any[], slug: string): any | null {
  const slugMap = generateUniqueSlugs(schools);
  return slugMap.get(slug) || null;
}

/**
 * Generate multiple possible slugs for a school name to handle variations
 * @param schoolName - The school name
 * @returns Array of possible slugs
 */
export function generatePossibleSlugs(schoolName: string): string[] {
  const baseSlug = generateSlug(schoolName);
  const slugs = [baseSlug];
  
  // Add variations for common school name patterns
  const variations = [
    // Remove "Public School" suffix
    schoolName.replace(/\s+(public|primary|secondary|high|central)\s+school$/i, ''),
    // Remove "PS", "SS", "HS" abbreviations
    schoolName.replace(/\s+(PS|SS|HS|CS)$/i, ''),
    // Remove "Primary", "Secondary" etc.
    schoolName.replace(/\s+(primary|secondary|high|central)$/i, ''),
  ];
  
  variations.forEach(variation => {
    if (variation !== schoolName) {
      const variationSlug = generateSlug(variation);
      if (variationSlug && variationSlug !== baseSlug && !slugs.includes(variationSlug)) {
        slugs.push(variationSlug);
      }
    }
  });
  
  return slugs;
}

/**
 * Extract school name from a slug (reverse operation)
 * Note: This is not perfect as we lose the original formatting
 * @param slug - The slug to convert back
 * @returns A human-readable school name
 */
export function slugToSchoolName(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

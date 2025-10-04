# School Detail Pages Documentation

## Overview

This project now includes fully functional dynamic school detail pages accessible via SEO-friendly URLs at `/schools/[slug]`. Each school has its own unique, shareable URL generated from the school name.

## Features

### 🎯 SEO-Friendly URLs
- **Format**: `/schools/[slug]`
- **Example**: `/schools/sydney-boys-high-school`
- **Slug Generation**: Converts school names to lowercase, replaces spaces with hyphens, removes special characters

### 📊 Comprehensive School Information
- **School Statistics**: Interactive charts showing enrollment trends and demographics
- **Interactive Map**: Shows school location with suburb boundaries, user location, and distance calculation
- **Programs & Activities**: Academic programs and extracurricular activities (when available)
- **School Images**: Image gallery with modal view (when available)
- **Detailed Information**: Complete school data including contact info, administrative details, etc.

### 🗺️ Interactive Map Features
- School location marker with pulsing animation
- Suburb boundary overlay with subtle highlighting
- User location detection (optional)
- Distance calculation and display
- Responsive design with mobile optimization

### 📈 Data Visualization
- **Bar Chart**: Current enrollment data
- **Pie Chart**: Student demographics (gender, Indigenous %, LBOTE %)
- **Statistics Summary**: Key metrics displayed prominently

### 🔍 SEO & Social Sharing
- Dynamic meta tags based on school information
- Open Graph tags for social media sharing
- Twitter Card support
- Structured data (JSON-LD) for search engines
- Canonical URLs

### 🎨 Modern UI/UX
- Responsive design with TailwindCSS
- Consistent with site branding (#002664, #d7153a)
- Interactive components with hover effects
- Loading states and error handling
- Accessible design with proper ARIA labels

## Technical Implementation

### File Structure
```
app/schools/[slug]/
├── page.tsx              # Main page component with metadata
├── loading.tsx           # Loading state component
└── not-found.tsx         # 404 error page

components/
├── SchoolDetailPage.tsx  # Main detail page component
├── MapSection.tsx        # Interactive map component
├── ImageGallery.tsx      # Image gallery with modal
└── ActivitiesList.tsx    # Programs and activities display

utils/
├── slug.ts              # Slug generation utilities
└── api.ts               # Data fetching functions
```

### Key Components

#### 1. SchoolDetailPage
- Main component that orchestrates all sections
- Handles collapsible sections for better UX
- Displays comprehensive school information
- Includes breadcrumb navigation

#### 2. MapSection
- Interactive Leaflet map integration
- School marker with pulsing animation
- User location detection and display
- Suburb boundary overlay
- Distance calculation and display

#### 3. ImageGallery
- Modal image viewer with navigation
- Responsive grid layout
- Image categorization (logo, building, grounds, activities)
- Lazy loading for performance

#### 4. ActivitiesList
- Tabbed interface for programs vs extracurricular
- Categorized display with icons and colors
- Responsive card layout

### Data Sources

#### Primary Data (NSW Public Schools API)
- School basic information
- Enrollment data
- Demographics (Indigenous %, LBOTE %)
- ICSEA values
- Contact information
- Administrative details

#### Extended Data (MySchool API - Placeholder)
- School images
- Academic programs
- Extracurricular activities
- Performance rankings

### Slug Generation

The slug generation system converts school names into URL-friendly strings:

```typescript
// Examples:
"Sydney Boys High School" → "sydney-boys-high-school"
"St. Mary's Primary School" → "st-marys-primary-school"
"Newtown High School of the Performing Arts" → "newtown-high-school-of-the-performing-arts"
```

### Performance Optimizations

- **ISR (Incremental Static Regeneration)**: Pages are statically generated with 1-hour revalidation
- **Static Path Generation**: All school paths are pre-generated at build time
- **Image Optimization**: Lazy loading and responsive images
- **Code Splitting**: Components are dynamically imported when needed
- **Caching**: API responses are cached with appropriate headers

### Error Handling

- **404 Pages**: Custom not-found pages for missing schools
- **Loading States**: Skeleton loaders during data fetching
- **Graceful Degradation**: Components handle missing data gracefully
- **API Fallbacks**: Multiple data source fallbacks

## Usage Examples

### Direct Access
```
https://nswschools.com.au/schools/sydney-boys-high-school
https://nswschools.com.au/schools/bondi-beach-public-school
```

### Programmatic Access
```typescript
import { generateSlug, findSchoolBySlug } from '@/utils/slug';
import { fetchCompleteSchoolData } from '@/utils/api';

// Generate slug from school name
const slug = generateSlug('Sydney Boys High School');
// Result: "sydney-boys-high-school"

// Fetch school data by slug
const school = await fetchCompleteSchoolData(slug);
```

### Integration with Existing Pages

The new slug-based pages are integrated with the existing school table:

```typescript
// In SchoolTable component
<Link href={`/schools/${generateSlug(school.School_name)}`}>
  Shareable Link
</Link>
```

## SEO Benefits

1. **Readable URLs**: School names are clearly visible in the URL
2. **Social Sharing**: Rich previews when shared on social media
3. **Search Engine Optimization**: Structured data and meta tags
4. **User Experience**: Easy to remember and share URLs
5. **Accessibility**: Proper semantic HTML and ARIA labels

## Future Enhancements

1. **Real MySchool API Integration**: Replace placeholder data with actual API calls
2. **User Reviews**: Add school review and rating system
3. **Comparison Tool**: Allow users to compare multiple schools
4. **Advanced Filtering**: Filter schools by various criteria
5. **Mobile App**: Native mobile application
6. **Analytics**: Track user engagement and popular schools

## Maintenance

- **Data Updates**: School data is automatically updated via ISR
- **Slug Changes**: If school names change, slugs are automatically regenerated
- **Performance Monitoring**: Monitor Core Web Vitals and user experience metrics
- **Error Tracking**: Monitor for API failures and user errors

## Testing

Run the slug generation test:
```bash
node test-slugs.js
```

This will verify that slug generation works correctly for various school name formats.

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolDetailPage from '@/components/SchoolDetailPage';
import { fetchCompleteSchoolData } from '@/utils/api';
import { generateSlug } from '@/utils/slug';

interface SchoolPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all schools (ISR)
// Temporarily disabled to troubleshoot 404 issues
// export async function generateStaticParams() {
//   try {
//     const paths = await generateSchoolPaths();
//     return paths;
//   } catch (error) {
//     console.error('Error generating static params:', error);
//     return [];
//   }
// }

// Generate dynamic metadata for each school
export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  // Simplified metadata for troubleshooting
  return {
    title: `${params.slug.replace(/-/g, ' ')} - NSW Public School`,
    description: `Learn about ${params.slug.replace(/-/g, ' ')} NSW Public School. View enrollment data, programs, location, and contact information.`,
  };
}

// Main page component
export default async function SchoolPage({ params }: SchoolPageProps) {
  try {
    const school = await fetchCompleteSchoolData(params.slug);
    
    if (!school) {
      notFound();
    }

    return <SchoolDetailPage school={school} slug={params.slug} />;
  } catch (error) {
    console.error('Error loading school page:', error);
    notFound();
  }
}

// Disable ISR temporarily for troubleshooting
// export const revalidate = 3600;

const API_URL = 'https://data.nsw.gov.au/data/dataset/78c10ea3-8d04-4c9c-b255-bbf8547e37e7/resource/b0026f18-2f23-4837-968c-959e5fb3311d/download/collections.json';

export async function getLastUpdatedDate(): Promise<string> {
  try {
    // Add cache-busting parameter to ensure fresh data
    const cacheBuster = new Date().getTime();
    const response = await fetch(`${API_URL}?t=${cacheBuster}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0 && data[0].Date_extracted) {
      const date = new Date(data[0].Date_extracted);
      const formattedDate = new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Australia/Sydney'
      }).format(date);
      
      // Get timezone abbreviation
      const timeZoneName = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        timeZoneName: 'short'
      }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'AEST';
      
      return `${formattedDate} ${timeZoneName}`;
    }
    
    return '';
  } catch (error) {
    console.error('Error fetching last update date:', error);
    return '';
  }
}

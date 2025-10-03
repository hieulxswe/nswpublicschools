/**
 * Get address suggestions using OpenStreetMap Nominatim API
 * @param query The address query
 * @returns Promise with address suggestions
 */
export async function getAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (!query.trim() || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=au&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Address suggestions failed');
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: {
        house_number: item.address?.house_number || '',
        road: item.address?.road || '',
        suburb: item.address?.suburb || item.address?.city || '',
        postcode: item.address?.postcode || '',
        state: item.address?.state || 'NSW',
        country: item.address?.country || 'Australia'
      }
    }));
  } catch (error) {
    console.error('Address suggestions error:', error);
    return [];
  }
}

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * @param address The address to geocode
 * @returns Promise with latitude and longitude
 */
export async function geocodeAddress(address: string): Promise<{lat: number, lon: number} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=au`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export interface AddressSuggestion {
  displayName: string;
  lat: number;
  lon: number;
  address: {
    house_number: string;
    road: string;
    suburb: string;
    postcode: string;
    state: string;
    country: string;
  };
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { School } from '@/types/school';
import Loading from '@/components/Loading';
import SchoolStatsChart from '@/components/SchoolStatsChart';
import { calculateDistance } from '@/utils/distance';

interface SchoolDetailsPageProps {
  params: {
    id: string;
  };
}

export default function SchoolDetailsPage({ params }: SchoolDetailsPageProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    summary: true,
    academic: true,
    administrative: false,
    contact: true,
    other: false,
  });

  const isMeaningfulValue = (val: unknown): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'number') return true;
    const s = String(val).trim();
    if (s === '') return false;
    const lower = s.toLowerCase();
    if (lower === 'n' || lower === 'n/a' || lower === 'na' || lower === 'not applicable') return false;
    return true;
  };

  const renderRow = (label: string, value?: string | number, hint?: string) => {
    if (!isMeaningfulValue(value)) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {hint && (
            <span
              className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-gray-100 text-gray-600"
              title={hint}
              aria-label={hint}
            >
              i
            </span>
          )}
        </div>
        <div className="text-sm text-gray-900 break-words">{value}</div>
      </div>
    );
  };

  const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((s) => ({ ...s, [id]: !s[id] }))}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-base sm:text-lg font-semibold text-[#002664]">{title}</h3>
        <svg
          className={`w-5 h-5 text-[#002664] transition-transform ${open[id] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open[id] && (
        <div className="px-4 sm:px-6 py-4">{children}</div>
      )}
    </div>
  );

  const MapSection: React.FC<{ lat: number; lng: number; name: string; suburb?: string; level?: string }> = ({ lat, lng, name, suburb, level }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const tileLayerAddedRef = useRef<boolean>(false);
    const userMarkerRef = useRef<any>(null);
    const schoolMarkerRef = useRef<any>(null);
    const suburbOverlayRef = useRef<any>(null);
    const suburbGeoJsonRef = useRef<any>(null);
    const schoolLabelRef = useRef<any>(null);
    const lineRef = useRef<any>(null);
    const distanceLabelRef = useRef<any>(null);
    const geolocationWatchIdRef = useRef<number | null>(null);
    const dimmedOverlayRef = useRef<any>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    useEffect(() => {
      if (!mapContainerRef.current) return;
      if (!lat || !lng) return;

      const ensureLeafletLoaded = async () => {
        const w = window as any;
        if (!w.L) {
          // Inject Leaflet CSS
          const existingCss = document.querySelector("link[data-leaflet]");
          if (!existingCss) {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            link.setAttribute('integrity', 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=');
            link.setAttribute('crossorigin', '');
            link.setAttribute('data-leaflet', 'true');
            document.head.appendChild(link);
          }

          // Inject Leaflet JS
          await new Promise<void>((resolve) => {
            const existing = document.querySelector("script[data-leaflet]");
            if (existing) {
              existing.addEventListener('load', () => resolve());
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.setAttribute('data-leaflet', 'true');
            script.onload = () => resolve();
            document.body.appendChild(script);
          });
        }
      };

      const init = async () => {
        await ensureLeafletLoaded();
        const L = (window as any).L;
        if (!L) return;

        // Avoid re-initialization
        let map = mapInstanceRef.current;
        if (!map) {
          map = L.map(mapContainerRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
          });
          mapInstanceRef.current = map;
        }

        if (!tileLayerAddedRef.current) {
          // Create dimmed tile layer for background using Carto Light basemap
          const dimmedTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: ['a', 'b', 'c', 'd'],
            maxZoom: 19,
            className: 'dimmed-tiles'
          }).addTo(map);

          // Add dimmed overlay effect
          const overlayDiv = document.createElement('div');
          overlayDiv.className = 'absolute inset-0 bg-black bg-opacity-40 pointer-events-none z-[1]';
          overlayDiv.style.position = 'absolute';
          overlayDiv.style.top = '0';
          overlayDiv.style.left = '0';
          overlayDiv.style.right = '0';
          overlayDiv.style.bottom = '0';
          overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          overlayDiv.style.pointerEvents = 'none';
          overlayDiv.style.zIndex = '1';
          map.getContainer().style.position = 'relative';
          map.getContainer().appendChild(overlayDiv);
          dimmedOverlayRef.current = overlayDiv;

          tileLayerAddedRef.current = true;
        }

        map.setView([lat, lng], 15);

        if (!schoolMarkerRef.current) {
          // Create school marker with enhanced styling
          const schoolIcon = L.divIcon({
            className: 'school-marker',
            html: `
              <div style="
                width: 24px; 
                height: 24px; 
                background: #d7153a; 
                border: 3px solid #002664; 
                border-radius: 50%; 
                box-shadow: 0 4px 12px rgba(0, 38, 100, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 12px;
              ">
                🏫
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          const marker = L.marker([lat, lng], { 
            icon: schoolIcon,
            zIndexOffset: 1000
          }).addTo(map);
          const popupHtml = `
            <div style="min-width:200px;background:white;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);overflow:hidden;border:1px solid rgba(0,0,0,0.06)">
              <div style="height:6px;background:#002664"></div>
              <div style="padding:10px 12px">
                <div style="font-weight:700;color:#002664;line-height:1.25">${name}</div>
                ${suburb ? `<div style="color:#4b5563;font-size:12px;margin-top:2px">${suburb}</div>` : ''}
                ${level ? `<div style="margin-top:8px;font-size:12px"><span style="background:#002664;color:white;padding:3px 8px;border-radius:9999px">${level}</span></div>` : ''}
              </div>
            </div>`;
          marker.bindPopup(popupHtml);
          schoolMarkerRef.current = marker;
          // Suburb polygon overlay will be loaded below via GeoJSON (non-interactive)
          if (suburb) {
            const labelHtml = `<div style=\"background:#d7153a;color:white;padding:3px 8px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:12px;white-space:nowrap\">${suburb}</div>`;
            schoolLabelRef.current = L.marker([lat + 0.0008, lng], { icon: L.divIcon({ className: '', html: labelHtml }), interactive: false }).addTo(map);
          }
        } else {
          schoolMarkerRef.current.setLatLng([lat, lng]);
          if (suburb) {
            const labelHtml = `<div style=\"background:#d7153a;color:white;padding:3px 8px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:12px;white-space:nowrap\">${suburb}</div>`;
            if (!schoolLabelRef.current) {
              schoolLabelRef.current = L.marker([lat + 0.0008, lng], { icon: L.divIcon({ className: '', html: labelHtml }), interactive: false }).addTo(map);
            } else {
              schoolLabelRef.current.setLatLng([lat + 0.0008, lng]);
              schoolLabelRef.current.setIcon(L.divIcon({ className: '', html: labelHtml }));
            }
          }
        }

        const updateDistanceLine = (userLat: number, userLng: number) => {
          const points = [[userLat, userLng], [lat, lng]];
          if (!lineRef.current) {
            // Create enhanced distance line with brand colors
            lineRef.current = L.polyline(points, { 
              color: '#002664', 
              weight: 4, 
              opacity: 0.9,
              dashArray: '8, 4',
              zIndexOffset: 900
            }).addTo(map);
          } else {
            lineRef.current.setLatLngs(points);
          }

          // Remove any existing distance label
          if (distanceLabelRef.current) {
            map.removeLayer(distanceLabelRef.current);
            distanceLabelRef.current = null;
          }

          // Fit bounds to include user, school, and suburb polygon when available
          const layersToFit: any[] = [];
          layersToFit.push(L.polyline(points));
          if (suburbGeoJsonRef.current) {
            layersToFit.push(suburbGeoJsonRef.current);
          }
          const group = L.featureGroup(layersToFit as any);
          const finalBounds = group.getBounds();
          map.fitBounds(finalBounds, { padding: [80, 80] });
        };

        const setUserLocation = (userLat: number, userLng: number) => {
          if (!userMarkerRef.current) {
            // Create enhanced user marker
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: `
                <div style="
                  width: 32px; 
                  height: 32px; 
                  background: #002664; 
                  border: 4px solid #d7153a; 
                  border-radius: 50%; 
                  box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  color: white;
                  font-size: 14px;
                  animation: pulse 2s infinite;
                ">
                  👤
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                  }
                </style>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            
            userMarkerRef.current = L.marker([userLat, userLng], { 
              icon: userIcon,
              zIndexOffset: 1100
            }).addTo(map);
            userMarkerRef.current.bindPopup('<div style=\"font-weight:600;color:#002664\">Your Location</div>');
          } else {
            userMarkerRef.current.setLatLng([userLat, userLng]);
          }
          updateDistanceLine(userLat, userLng);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude: uLat, longitude: uLng } = pos.coords;
              setUserLocation(uLat, uLng);
            },
            (err) => {
              setGeoError('Location permission denied or unavailable. Showing school location only.');
            },
            { enableHighAccuracy: true, maximumAge: 20000, timeout: 10000 }
          );
          geolocationWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude: uLat, longitude: uLng } = pos.coords;
              setUserLocation(uLat, uLng);
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 20000, timeout: 10000 }
          );
        }

        // Helper: load suburb polygon from Nominatim (OpenStreetMap)
        const loadSuburbPolygon = async () => {
          if (!suburb) return;
          try {
            const parts = suburb.split(' ').filter(Boolean);
            let postcode = '';
            let suburbName = suburb;
            const last = parts[parts.length - 1];
            if (/^\d{4}$/.test(last)) {
              postcode = last;
              suburbName = parts.slice(0, -1).join(' ');
            }
            const query = encodeURIComponent(`${suburbName}, New South Wales${postcode ? ' ' + postcode : ''}, Australia`);
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=1&q=${query}`;
            const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const results = await resp.json();
            if (Array.isArray(results) && results.length > 0 && results[0].geojson) {
              if (suburbGeoJsonRef.current) {
                map.removeLayer(suburbGeoJsonRef.current);
                suburbGeoJsonRef.current = null;
              }
              // Create non-interactive pane to ensure polygon stays below markers
              const paneName = 'suburb-pane';
              if (!map.getPane(paneName)) {
                map.createPane(paneName);
                const pane = map.getPane(paneName);
                if (pane) pane.style.zIndex = '350'; // below default overlay (400) and markers (600)
              }
              const polygonLayer = L.geoJSON(results[0].geojson, {
                pane: paneName,
                style: () => ({
                  color: '#002664',
                  weight: 3,
                  opacity: 0.9,
                  fillColor: '#d7153a',
                  fillOpacity: 0.25,
                  interactive: false,
                  className: 'suburb-polygon'
                }),
                interactive: false,
                zIndexOffset: 800
              }).addTo(map);
              suburbGeoJsonRef.current = polygonLayer;

              // Fit bounds on initial load to include polygon and school marker
              const items: any[] = [polygonLayer, L.marker([lat, lng])];
              if (userMarkerRef.current) items.push(userMarkerRef.current);
              const fg = L.featureGroup(items);
              const b = fg.getBounds();
              if (b && b.isValid()) {
                map.fitBounds(b, { padding: [64, 64] });
              }
            }
          } catch {
            // Silently ignore polygon load failures
          }
        };

        // Trigger polygon load after map and marker are ready
        loadSuburbPolygon();

        mapInstanceRef.current = map;
      };

      init();

      return () => {
        try {
          if (geolocationWatchIdRef.current !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(geolocationWatchIdRef.current);
            geolocationWatchIdRef.current = null;
          }
          if (dimmedOverlayRef.current && mapContainerRef.current) {
            mapContainerRef.current.removeChild(dimmedOverlayRef.current);
            dimmedOverlayRef.current = null;
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        } catch {}
      };
    }, [lat, lng, name, suburb, level]);

    return (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="relative">
          <style jsx>{`
            .school-marker, .user-marker, .distance-label {
              z-index: 1000 !important;
            }
            .leaflet-marker-icon {
              z-index: 1000 !important;
            }
            .leaflet-marker-pane {
              z-index: 1000 !important;
            }
            .leaflet-popup-pane {
              z-index: 2000 !important;
            }
            .suburb-polygon {
              z-index: 800 !important;
            }
          `}</style>
          {geoError && (
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-2 z-[2000]">
              <div className="px-3 py-1 rounded-full text-xs text-white bg-[#002664]/90 shadow-md">
                {geoError}
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 sm:h-12 bg-gradient-to-b from-gray-50 to-transparent z-[1]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 sm:h-12 bg-gradient-to-t from-gray-50 to-transparent z-[1]" />
          <div 
            className="h-72 sm:h-96 md:h-[520px] shadow-lg ring-1 ring-black/5 rounded-none sm:rounded-xl overflow-hidden relative" 
            ref={mapContainerRef}
            style={{ position: 'relative' }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        
        // Get school data from localStorage or fetch from API
        const storedSchools = localStorage.getItem('nsw-schools-data');
        if (storedSchools) {
          const schools: School[] = JSON.parse(storedSchools);
          const foundSchool = schools.find(s => s.School_code === params.id);
          
          if (foundSchool) {
            setSchool(foundSchool);
          } else {
            setError('School not found');
          }
        } else {
          // Fallback: fetch from API
          const response = await fetch('https://data.nsw.gov.au/data/dataset/78c10ea3-8d04-4c9c-b255-bbf8547e37e7/resource/b0026f18-2f23-4837-968c-959e5fb3311d/download/collections.json');
          const data = await response.json();
          
          const transformedSchools: School[] = data.map((item: any) => ({
            School_name: item.School_name || '',
            Town_suburb: item.Town_suburb || '',
            Postcode: item.Postcode || '',
            Phone: item.Phone || '',
            School_Email: item.School_Email || '',
            Website: item.Website || '',
            Level_of_schooling: item.Level_of_schooling || '',
            Latitude: parseFloat(item.Latitude) || 0,
            Longitude: parseFloat(item.Longitude) || 0,
            Street: item.Street || '',
            School_code: item.School_code || '',
            AgeID: item.AgeID || '',
            Fax: item.Fax || '',
            latest_year_enrolment_FTE: item.latest_year_enrolment_FTE || '',
            Indigenous_pct: item.Indigenous_pct || '',
            LBOTE_pct: item.LBOTE_pct || '',
            ICSEA_value: item.ICSEA_value || '',
            Selective_school: item.Selective_school || '',
            Opportunity_class: item.Opportunity_class || '',
            School_specialty_type: item.School_specialty_type || '',
            School_subtype: item.School_subtype || '',
            Support_classes: item.Support_classes || '',
            Preschool_ind: item.Preschool_ind || '',
            Distance_education: item.Distance_education || '',
            Intensive_english_centre: item.Intensive_english_centre || '',
            School_gender: item.School_gender || '',
            Late_opening_school: item.Late_opening_school || '',
            Date_1st_teacher: item.Date_1st_teacher || '',
            LGA: item.LGA || '',
            electorate_from_2023: item.electorate_from_2023 || '',
            electorate_2015_2022: item.electorate_2015_2022 || '',
            fed_electorate_from_2025: item.fed_electorate_from_2025 || '',
            fed_electorate_2016_2024: item.fed_electorate_2016_2024 || '',
            Operational_directorate: item.Operational_directorate || '',
            Principal_network: item.Principal_network || '',
            Operational_directorate_office: item.Operational_directorate_office || '',
            Operational_directorate_office_phone: item.Operational_directorate_office_phone || '',
            Operational_directorate_office_address: item.Operational_directorate_office_address || '',
            FACS_district: item.FACS_district || '',
            Local_health_district: item.Local_health_district || '',
            AECG_region: item.AECG_region || '',
            ASGS_remoteness: item.ASGS_remoteness || '',
            "Assets unit": item["Assets unit"] || '',
            SA4: item.SA4 || '',
            FOEI_Value: item.FOEI_Value || '',
            Date_extracted: item.Date_extracted || '',
          }));
          
          const foundSchool = transformedSchools.find(s => s.School_code === params.id);
          
          if (foundSchool) {
            setSchool(foundSchool);
            // Store in localStorage for future use
            localStorage.setItem('nsw-schools-data', JSON.stringify(transformedSchools));
          } else {
            setError('School not found');
          }
        }
      } catch (err) {
        setError('Failed to load school details');
        console.error('Error fetching school:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleBack}
                className="btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back + Summary */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-[#002664] hover:text-[#d7153a] mb-4 transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#002664]">{school.School_name}</h1>
                <p className="text-sm sm:text-base text-gray-600">{school.Town_suburb} {school.Postcode}</p>
              </div>
              <div className="flex flex-col sm:items-end text-sm text-gray-700">
                {school.Level_of_schooling && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#002664] text-white mb-2 w-max">
                    {school.Level_of_schooling}
                  </span>
                )}
                <div className="space-y-1">
                  {school.Phone && <div><span className="font-medium">Phone:</span> {school.Phone}</div>}
                  {school.School_Email && <div><span className="font-medium">Email:</span> {school.School_Email}</div>}
                  {school.Website && (
                    <div>
                      <a
                        href={school.Website.startsWith('http') ? school.Website : `https://${school.Website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#002664] hover:text-[#d7153a] underline hover:no-underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Statistics Chart */}
        <div className="mb-8">
          <SchoolStatsChart school={school} />
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          <Section id="contact" title="Contact & Location">
            <div className="grid grid-cols-1 gap-2">
              {renderRow('Address', `${school.Street || ''}${school.Street ? ', ' : ''}${school.Town_suburb || ''} ${school.Postcode || ''}`.trim())}
              {renderRow('Phone', school.Phone)}
              {renderRow('Email', school.School_Email)}
              {renderRow('Latitude', school.Latitude)}
              {renderRow('Longitude', school.Longitude)}
              {renderRow('Website', school.Website)}
              {renderRow('Fax', (school as any).Fax)}
            </div>
          </Section>

          <Section id="academic" title="Academic Information">
            <div className="grid grid-cols-1 gap-2">
              {renderRow('Level of Schooling', school.Level_of_schooling)}
              {renderRow('ICSEA Value', school.ICSEA_value, 'Index of Community Socio-Educational Advantage')}
              {renderRow('Enrolment (FTE)', school.latest_year_enrolment_FTE, 'Full-time equivalent enrolments (latest year)')}
              {renderRow('Indigenous %', school.Indigenous_pct, 'Percentage of students identifying as Aboriginal and/or Torres Strait Islander')}
              {renderRow('LBOTE %', school.LBOTE_pct, 'Language Background Other Than English')}
              {renderRow('Selective School', school.Selective_school)}
              {renderRow('Opportunity Class', school.Opportunity_class)}
              {renderRow('School Specialty Type', school.School_specialty_type)}
              {renderRow('Subtype', school.School_subtype)}
              {renderRow('Support Classes', school.Support_classes)}
              {renderRow('Preschool', school.Preschool_ind)}
              {renderRow('Distance Education', school.Distance_education)}
              {renderRow('Intensive English Centre', school.Intensive_english_centre)}
              {renderRow('Gender', school.School_gender)}
              {renderRow('Late Opening School', school.Late_opening_school)}
            </div>
          </Section>

          <Section id="administrative" title="Administrative Information">
            <div className="grid grid-cols-1 gap-2">
              {renderRow('School Code', school.School_code)}
              {renderRow('AgeID', school.AgeID, 'Unique age identifier in dataset')}
              {renderRow('Operational Directorate', school.Operational_directorate)}
              {renderRow('Principal Network', school.Principal_network)}
              {renderRow('Directorate Office', school.Operational_directorate_office)}
              {renderRow('Directorate Office Phone', school.Operational_directorate_office_phone)}
              {renderRow('Directorate Office Address', school.Operational_directorate_office_address)}
              {renderRow('LGA', school.LGA, 'Local Government Area')}
              {renderRow('Electorate (from 2023)', school.electorate_from_2023)}
              {renderRow('Electorate (2015–2022)', school.electorate_2015_2022)}
              {renderRow('Federal Electorate (from 2025)', school.fed_electorate_from_2025)}
              {renderRow('Federal Electorate (2016–2024)', school.fed_electorate_2016_2024)}
              {renderRow('FACS District', school.FACS_district, 'Family and Community Services District')}
              {renderRow('Local Health District', school.Local_health_district)}
              {renderRow('AECG Region', school.AECG_region, 'Aboriginal Education Consultative Group region')}
              {renderRow('ASGS Remoteness', school.ASGS_remoteness, 'Australian Statistical Geography Standard remoteness area')}
              {renderRow('Assets Unit', (school as any)['Assets unit'], 'Department assets management region')}
              {renderRow('SA4', school.SA4, 'Statistical Area Level 4')}
              {renderRow('FOEI Value', school.FOEI_Value, 'Family Occupation and Education Index')}
              {renderRow('Date First Teacher', school.Date_1st_teacher)}
              {renderRow('Date Extracted', school.Date_extracted)}
            </div>
          </Section>

          {/* Optional Other Info for future fields */}
          <Section id="other" title="Other Information">
            <div className="text-sm text-gray-600">
              This section can include additional fields from future dataset updates.
            </div>
          </Section>
        </div>
        {/* Full-width Map Section */}
        <div className="mt-8">
          <MapSection
            lat={Number(school.Latitude)}
            lng={Number(school.Longitude)}
            name={school.School_name}
            suburb={`${school.Town_suburb} ${school.Postcode}`.trim()}
            level={school.Level_of_schooling}
          />
        </div>
      </div>
    </div>
  );
}

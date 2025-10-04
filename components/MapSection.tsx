'use client';

import React, { useRef, useEffect, useState } from 'react';

interface MapSectionProps {
  lat: number;
  lng: number;
  name: string;
  suburb?: string;
  level?: string;
  address?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ 
  lat, 
  lng, 
  name, 
  suburb, 
  level, 
  address 
}) => {
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
  const [userLocation, setUserLocationState] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

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

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
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
        // Create school marker with enhanced styling and pulsing animation
        const schoolIcon = L.divIcon({
          className: 'school-marker',
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: #d7153a; 
              border: 4px solid #002664; 
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
              🏫
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4); }
                50% { transform: scale(1.1); box-shadow: 0 8px 20px rgba(215, 21, 58, 0.6); }
                100% { transform: scale(1); box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4); }
              }
            </style>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        
        const marker = L.marker([lat, lng], { 
          icon: schoolIcon,
          zIndexOffset: 1000
        }).addTo(map);
        
        const popupHtml = `
          <div style="min-width:250px;background:white;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);overflow:hidden;border:1px solid rgba(0,0,0,0.06)">
            <div style="height:6px;background:#002664"></div>
            <div style="padding:12px 16px">
              <div style="font-weight:700;color:#002664;line-height:1.25;font-size:16px">${name}</div>
              ${address ? `<div style="color:#4b5563;font-size:13px;margin-top:4px">${address}</div>` : ''}
              ${suburb ? `<div style="color:#4b5563;font-size:12px;margin-top:2px">${suburb}</div>` : ''}
              ${level ? `<div style="margin-top:8px;font-size:12px"><span style="background:#002664;color:white;padding:4px 10px;border-radius:9999px">${level}</span></div>` : ''}
            </div>
          </div>`;
        marker.bindPopup(popupHtml);
        schoolMarkerRef.current = marker;
        
        // Add suburb label
        if (suburb) {
          const labelHtml = `<div style="background:#d7153a;color:white;padding:4px 10px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:13px;white-space:nowrap;font-weight:600">${suburb}</div>`;
          schoolLabelRef.current = L.marker([lat + 0.001, lng], { 
            icon: L.divIcon({ className: '', html: labelHtml }), 
            interactive: false 
          }).addTo(map);
        }
      } else {
        schoolMarkerRef.current.setLatLng([lat, lng]);
        if (suburb && schoolLabelRef.current) {
          const labelHtml = `<div style="background:#d7153a;color:white;padding:4px 10px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:13px;white-space:nowrap;font-weight:600">${suburb}</div>`;
          schoolLabelRef.current.setLatLng([lat + 0.001, lng]);
          schoolLabelRef.current.setIcon(L.divIcon({ className: '', html: labelHtml }));
        }
      }

      const updateDistanceLine = (userLat: number, userLng: number) => {
        const points = [[userLat, userLng], [lat, lng]];
        const calculatedDistance = calculateDistance(userLat, userLng, lat, lng);
        setDistance(calculatedDistance);
        
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

        // Add distance label at midpoint
        const midLat = (userLat + lat) / 2;
        const midLng = (userLng + lng) / 2;
        const distanceText = calculatedDistance < 1 
          ? `${(calculatedDistance * 1000).toFixed(0)}m`
          : `${calculatedDistance.toFixed(1)}km`;
        
        const distanceLabelHtml = `<div style="background:rgba(0,38,100,0.9);color:white;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${distanceText}</div>`;
        distanceLabelRef.current = L.marker([midLat, midLng], { 
          icon: L.divIcon({ className: '', html: distanceLabelHtml }), 
          interactive: false 
        }).addTo(map);

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
        setUserLocationState({ lat: userLat, lng: userLng });
        
        if (!userMarkerRef.current) {
          // Create enhanced user marker
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `
              <div style="
                width: 36px; 
                height: 36px; 
                background: #002664; 
                border: 4px solid #d7153a; 
                border-radius: 50%; 
                box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 16px;
                animation: userPulse 2s infinite;
              ">
                👤
              </div>
              <style>
                @keyframes userPulse {
                  0% { transform: scale(1); box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4); }
                  50% { transform: scale(1.1); box-shadow: 0 8px 20px rgba(215, 21, 58, 0.6); }
                  100% { transform: scale(1); box-shadow: 0 6px 16px rgba(215, 21, 58, 0.4); }
                }
              </style>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          
          userMarkerRef.current = L.marker([userLat, userLng], { 
            icon: userIcon,
            zIndexOffset: 1100
          }).addTo(map);
          userMarkerRef.current.bindPopup('<div style="font-weight:600;color:#002664;font-size:14px">Your Location</div>');
        } else {
          userMarkerRef.current.setLatLng([userLat, userLng]);
        }
        updateDistanceLine(userLat, userLng);
      };

      // Get user location
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
              if (pane) pane.style.zIndex = '350';
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
  }, [lat, lng, name, suburb, level, address]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#002664]">School Location</h3>
            <p className="text-sm text-gray-600 mt-1">Interactive map with location details</p>
          </div>
          {distance && (
            <div className="text-right">
              <div className="text-sm font-medium text-[#002664]">
                {distance < 1 
                  ? `${(distance * 1000).toFixed(0)}m away`
                  : `${distance.toFixed(1)}km away`
                }
              </div>
              <div className="text-xs text-gray-500">from your location</div>
            </div>
          )}
        </div>
      </div>
      
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
          className="h-80 sm:h-96 md:h-[520px] shadow-lg ring-1 ring-black/5 rounded-none sm:rounded-xl overflow-hidden relative" 
          ref={mapContainerRef}
          style={{ position: 'relative' }}
        />
      </div>
    </div>
  );
};

export default MapSection;

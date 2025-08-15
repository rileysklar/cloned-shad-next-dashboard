'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertTriangle, Filter, Layers } from 'lucide-react';
import { useThemeConfig } from '@/components/active-theme';
import { TrafficIncident } from '@/types/traffic';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SimpleMapProps {
  incidents: TrafficIncident[];
  filters?: any;
}

export function SimpleMap({ incidents = [], filters }: SimpleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const { activeTheme } = useThemeConfig();

  // Theme-aware colors - using hex values that Mapbox can parse
  const getThemeColors = () => {
    switch (activeTheme) {
      case 'blue':
      case 'blue-scaled':
        return {
          active: '#3b82f6', // Blue
          resolved: '#16a34a', // Green
          closed: '#64748b', // Gray
          other: '#eab308' // Yellow
        };
      case 'green':
      case 'green-scaled':
        return {
          active: '#16a34a', // Green
          resolved: '#3b82f6', // Blue
          closed: '#64748b', // Gray
          other: '#eab308' // Yellow
        };
      case 'amber':
      case 'amber-scaled':
        return {
          active: '#eab308', // Amber
          resolved: '#16a34a', // Green
          closed: '#64748b', // Gray
          other: '#3b82f6' // Blue
        };
      default:
        return {
          active: '#ef4444', // Red
          resolved: '#16a34a', // Green
          closed: '#64748b', // Gray
          other: '#eab308' // Yellow
        };
    }
  };

  // Get background color for stroke - convert CSS variable to actual color
  const getBackgroundColor = () => {
    // Check if we're in dark mode
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#ffffff' : '#000000'; // White for dark mode, black for light mode
  };

  const themeColors = getThemeColors();

  useEffect(() => {
    console.log('SimpleMap: useEffect triggered');
    console.log('SimpleMap: mapContainer.current:', !!mapContainer.current);
    console.log('SimpleMap: incidents count:', incidents.length);
    console.log('SimpleMap: active theme:', activeTheme);

    if (!mapContainer.current) {
      console.log('SimpleMap: Container not ready');
      return;
    }

    if (map.current) {
      console.log('SimpleMap: Map already exists');
      return;
    }

    console.log('SimpleMap: Starting map initialization...');

    // Dynamic import to avoid SSR issues
    const initMap = async () => {
      try {
        // Import the standard Mapbox GL JS
        const mapboxgl = await import('mapbox-gl');

        console.log('SimpleMap: Mapbox module imported');

        // Check if we need to use default or direct properties
        const mapbox = mapboxgl.default || mapboxgl;
        mapboxRef.current = mapbox; // Store reference for use in other functions

        // For Mapbox GL JS v3, we need to set the access token differently
        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        console.log('SimpleMap: Access token available:', !!accessToken);

        console.log('SimpleMap: Creating map...');

        // Create the map with access token in the options
        map.current = new mapbox.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12', // Fallback to default style
          center: [-97.7431, 30.2672], // Austin, TX
          zoom: 10,
          accessToken: accessToken // Pass access token in options for v3
        });

        // Try to load custom style after map creation
        try {
          map.current.setStyle(
            'mapbox://styles/rileysklar1/cmecbbbxk00f801s4adxi9lp4'
          );
          console.log('SimpleMap: Custom style loaded successfully');
        } catch (styleError) {
          console.warn(
            'SimpleMap: Failed to load custom style, using default:',
            styleError
          );
        }

        console.log('SimpleMap: Map created successfully');

        map.current.on('load', () => {
          console.log('SimpleMap: Map loaded successfully');
          setMapLoaded(true);

          // Add incidents data after map loads
          if (incidents.length > 0) {
            addIncidentsLayer();
          }
        });

        map.current.on('error', (error: any) => {
          console.error('SimpleMap: Map error:', error);
          console.error('SimpleMap: Error details:', {
            message: error.message,
            type: error.type,
            target: error.target,
            error: error
          });
        });

        // Add style loading error handler
        map.current.on('styleimagemissing', (e: any) => {
          console.warn('SimpleMap: Missing style image:', e.id);
        });

        // Add source loading error handler
        map.current.on('sourcedata', (e: any) => {
          if (e.isSourceLoaded && e.sourceId === 'mapbox') {
            console.log('SimpleMap: Mapbox source loaded successfully');
          }
        });
      } catch (error) {
        console.error('SimpleMap: Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [activeTheme]);

  // Add incidents layer when incidents data changes
  useEffect(() => {
    if (mapLoaded && map.current && incidents.length > 0) {
      console.log(
        'SimpleMap: Adding incidents layer with',
        incidents.length,
        'incidents'
      );
      console.log('SimpleMap: Current filters:', filters);
      addIncidentsLayer();
    }
  }, [incidents, mapLoaded, activeTheme, filters]);

  const addIncidentsLayer = () => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove existing incidents layer if it exists
      if (map.current.getLayer('incidents')) {
        map.current.removeLayer('incidents');
      }
      if (map.current.getSource('incidents')) {
        map.current.removeSource('incidents');
      }

      // Filter incidents based on current filters
      let filteredIncidents = incidents;

      if (filters) {
        filteredIncidents = incidents.filter((incident) => {
          // Filter by status
          if (
            filters.status &&
            filters.status !== 'all' &&
            incident.traffic_report_status !== filters.status
          ) {
            return false;
          }

          // Filter by agency
          if (
            filters.agency &&
            filters.agency !== 'all' &&
            incident.agency !== filters.agency
          ) {
            return false;
          }

          // Filter by issue type
          if (
            filters.issue_type &&
            filters.issue_type !== 'all' &&
            incident.issue_reported !== filters.issue_type
          ) {
            return false;
          }

          // Filter by date range
          if (filters.date_range) {
            const incidentDate = new Date(incident.published_date);
            if (
              filters.date_range.start &&
              incidentDate < filters.date_range.start
            ) {
              return false;
            }
            if (
              filters.date_range.end &&
              incidentDate > filters.date_range.end
            ) {
              return false;
            }
          }

          return true;
        });
      }

      console.log(
        'SimpleMap: Filtered incidents count:',
        filteredIncidents.length,
        'from total:',
        incidents.length
      );

      // Convert filtered incidents to GeoJSON format
      const geojson = {
        type: 'FeatureCollection',
        features: filteredIncidents.map((incident) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(incident.longitude),
              parseFloat(incident.latitude)
            ]
          },
          properties: {
            id: incident.traffic_report_id,
            description: incident.issue_reported,
            status: incident.traffic_report_status,
            published_date: incident.published_date,
            address: incident.address,
            agency: incident.agency
          }
        }))
      };

      console.log(
        'SimpleMap: Adding incidents source with',
        incidents.length,
        'features'
      );

      // Add the incidents source
      map.current.addSource('incidents', {
        type: 'geojson',
        data: geojson
      });

      // Add the incidents layer with theme-aware colors
      map.current.addLayer({
        id: 'incidents',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            6, // Zoom level 8: radius 6
            12,
            10, // Zoom level 12: radius 10
            16,
            16 // Zoom level 16: radius 16
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'status'], 'ACTIVE'],
            themeColors.active,
            ['==', ['get', 'status'], 'RESOLVED'],
            themeColors.resolved,
            ['==', ['get', 'status'], 'CLOSED'],
            themeColors.closed,
            themeColors.other
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': getBackgroundColor(),
          'circle-opacity': 0.8
        }
      });

      // Add click handler for incidents
      map.current.on('click', 'incidents', (e: any) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        // Create popup content with theme-aware styling
        const popupContent = `
          <div style="padding: 12px; max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">${properties.description}</h3>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(properties.status)};"></span>
              <span style="font-size: 12px; color: #6b7280;"><strong>Status:</strong> ${properties.status}</span>
            </div>
            <p style="margin: 4px 0; font-size: 12px; color: #6b7280;"><strong>Date:</strong> ${new Date(properties.published_date).toLocaleDateString()}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #6b7280;"><strong>Address:</strong> ${properties.address}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #6b7280;"><strong>Agency:</strong> ${properties.agency}</p>
          </div>
        `;

        // Create and show popup
        new mapboxRef.current.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px',
          className: 'theme-aware-popup'
        })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'incidents', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'incidents', () => {
        map.current.getCanvas().style.cursor = '';
      });

      console.log('SimpleMap: Incidents layer added successfully');
    } catch (error) {
      console.error('SimpleMap: Error adding incidents layer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return themeColors.active;
      case 'RESOLVED':
        return themeColors.resolved;
      case 'CLOSED':
        return themeColors.closed;
      default:
        return themeColors.other;
    }
  };

  return (
    <Card className='border-border/50 overflow-hidden border-2 shadow-lg'>
      <CardHeader className=''>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary/10 rounded-lg p-2'>
              <MapPin className='text-primary h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg font-semibold'>
                Traffic Incidents Map
              </CardTitle>
              <div className='text-muted-foreground text-sm'>
                {incidents.length > 0 ? (
                  <>
                    {(() => {
                      // Calculate filtered count
                      let filteredCount = incidents.length;
                      if (filters) {
                        filteredCount = incidents.filter((incident) => {
                          if (
                            filters.status &&
                            filters.status !== 'all' &&
                            incident.traffic_report_status !== filters.status
                          )
                            return false;
                          if (
                            filters.agency &&
                            filters.agency !== 'all' &&
                            incident.agency !== filters.agency
                          )
                            return false;
                          if (
                            filters.issue_type &&
                            filters.issue_type !== 'all' &&
                            incident.issue_reported !== filters.issue_type
                          )
                            return false;
                          if (filters.date_range) {
                            const incidentDate = new Date(
                              incident.published_date
                            );
                            if (
                              filters.date_range.start &&
                              incidentDate < filters.date_range.start
                            )
                              return false;
                            if (
                              filters.date_range.end &&
                              incidentDate > filters.date_range.end
                            )
                              return false;
                          }
                          return true;
                        }).length;
                      }
                      return filteredCount === incidents.length
                        ? `${incidents.length} incidents displayed`
                        : `${filteredCount} of ${incidents.length} incidents displayed`;
                    })()}
                  </>
                ) : (
                  'No incidents to display'
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className='hover:bg-muted/50 rounded-lg p-2 transition-colors'
              title={showLegend ? 'Hide Legend' : 'Show Legend'}
            >
              <Layers className='h-4 w-4' />
            </button>
            {filters && Object.keys(filters).length > 0 && (
              <div className='bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs'>
                <Filter className='h-3 w-3' />
                <span>Filtered</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='relative'>
          <div ref={mapContainer} className='h-[600px] w-full' />

          {/* Map Legend */}
          {showLegend && (
            <div className='bg-background/95 border-border/50 absolute top-4 right-4 rounded-lg border p-4 shadow-xl backdrop-blur-sm'>
              <div className='text-foreground mb-3 text-sm font-medium'>
                Incident Status
              </div>
              <div className='space-y-2 text-xs'>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: themeColors.active }}
                  ></div>
                  <span className='text-foreground'>Active</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: themeColors.resolved }}
                  ></div>
                  <span className='text-foreground'>Resolved</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: themeColors.closed }}
                  ></div>
                  <span className='text-foreground'>Closed</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: themeColors.other }}
                  ></div>
                  <span className='text-foreground'>Other</span>
                </div>
              </div>

              {/* Theme indicator */}
              <div className='border-border/50 mt-3 border-t pt-2'>
                <div className='text-muted-foreground text-xs'>
                  Theme:{' '}
                  <span className='font-medium capitalize'>
                    {activeTheme.replace('-scaled', '')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

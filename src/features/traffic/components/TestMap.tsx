'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function TestMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    console.log('TestMap: useEffect triggered');

    if (!mapContainer.current) {
      console.log('TestMap: Container not ready');
      return;
    }

    if (map.current) {
      console.log('TestMap: Map already exists');
      return;
    }

    console.log('TestMap: Starting map initialization...');

    const initMap = async () => {
      try {
        console.log('TestMap: About to import mapbox-gl');
        const mapboxgl = await import('mapbox-gl');
        console.log('TestMap: Mapbox imported successfully');

        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        console.log('TestMap: Access token available:', !!accessToken);

        console.log('TestMap: Creating map...');
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/rileysklar1/cmecbbbxk00f801s4adxi9lp4',
          center: [-97.7431, 30.2672],
          zoom: 10,
          accessToken: accessToken
        });

        console.log('TestMap: Map created successfully');

        map.current.on('load', () => {
          console.log('TestMap: Map loaded successfully');
        });

        map.current.on('error', (error: any) => {
          console.error('TestMap: Map error:', error);
        });
      } catch (error) {
        console.error('TestMap: Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Test Map
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div
          ref={mapContainer}
          className='h-[300px] w-full border-2 border-purple-500'
        />
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { TrafficFilters } from '@/features/traffic/components';
import { SimpleMap } from '@/features/traffic/components/SimpleMap';
import { useTrafficIncidents } from '@/features/traffic/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Layers, Filter as FilterIcon } from 'lucide-react';
import { TrafficIncidentFilters } from '@/types/traffic';
import PageContainer from '@/components/layout/page-container';
import { ScrollToTop } from '@/components/scroll-to-top';

export default function TrafficMapPage() {
  console.log('TrafficMapPage: Component function starting...');

  const [filters, setFilters] = useState<TrafficIncidentFilters>({});
  console.log('TrafficMapPage: Filters state initialized');

  const { incidents, loading, refresh, fetchWithFilters } =
    useTrafficIncidents();
  console.log('TrafficMapPage: Hook called, received:', {
    incidents: incidents.length,
    loading
  });

  // Debug logging
  console.log('TrafficMapPage: Component rendered');
  console.log('TrafficMapPage: incidents count:', incidents.length);
  console.log('TrafficMapPage: loading state:', loading);
  console.log('TrafficMapPage: incidents data:', incidents);

  const handleFiltersChange = async (newFilters: TrafficIncidentFilters) => {
    setFilters(newFilters);

    // Check if we have any active filters
    const hasActiveFilters = Object.keys(newFilters).some((key) => {
      const value = newFilters[key as keyof TrafficIncidentFilters];
      if (key === 'date_range') {
        const dateRange = value as { start?: Date; end?: Date } | undefined;
        return dateRange && (dateRange.start || dateRange.end);
      }
      return value !== undefined && value !== '';
    });

    if (hasActiveFilters) {
      await fetchWithFilters(newFilters);
    } else {
      // If no filters, refresh to get all incidents
      await refresh();
    }
  };

  return (
    <PageContainer className='p-4 md:px-6'>
      <div className='mx-auto min-h-0 w-full max-w-7xl space-y-6'>
        {/* Header Section - Fixed at top */}
        <div className='sticky top-0 z-10 rounded-lg'>
          {/* Title and Description */}
          <div className='mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row'>
            <div>
              <h1 className='text-2xl font-bold sm:text-3xl'>
                Traffic Incidents Map
              </h1>
            </div>
            <div className='flex flex-shrink-0 gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  console.log('TrafficMapPage: Manual test button clicked');
                  console.log(
                    'TrafficMapPage: Current incidents:',
                    incidents.length
                  );
                  console.log('TrafficMapPage: Current loading:', loading);
                  refresh();
                }}
              >
                Test Data
              </Button>
            </div>
          </div>

          {/* Filters integrated into header */}
          <TrafficFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
        </div>

        {/* Map Content */}
        <div className='space-y-6 pb-8'>
          <SimpleMap incidents={incidents} filters={filters} />
        </div>
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />
    </PageContainer>
  );
}

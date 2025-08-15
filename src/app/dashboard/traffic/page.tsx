'use client';

import React, { useState } from 'react';
import { TrafficIncidentList } from '@/features/traffic/components/TrafficIncidentList';
import { TrafficCharts } from '@/features/traffic/components/TrafficCharts';
import { TrafficFilters } from '@/features/traffic/components/TrafficFilters';
import { useTrafficIncidents } from '@/features/traffic/utils';
import { Button } from '@/components/ui/button';
import { BarChart3, List, RefreshCw } from 'lucide-react';
import { TrafficIncidentFilters } from '@/types/traffic';
import PageContainer from '@/components/layout/page-container';
import { ScrollToTop } from '@/components/scroll-to-top';

export default function TrafficPage() {
  const [viewMode, setViewMode] = useState<'charts' | 'list'>('charts');
  const [filters, setFilters] = useState<TrafficIncidentFilters>({});
  const { incidents, loading, refresh, fetchWithFilters } =
    useTrafficIncidents();

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
        <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 rounded-lg backdrop-blur'>
          {/* Title and Description */}
          <div className='mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row'>
            <div>
              <h1 className='text-2xl font-bold sm:text-3xl'>
                Traffic Incidents Dashboard
              </h1>
              <p className='text-muted-foreground mt-2 text-sm sm:text-base'>
                Real-time traffic incident reports from Austin Transportation
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                Default view shows incidents from the last 7 days. Use filters
                to adjust the date range.
              </p>
            </div>
            <div className='flex flex-shrink-0 gap-2'>
              <Button
                variant={viewMode === 'charts' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('charts')}
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                Charts
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                <List className='mr-2 h-4 w-4' />
                List
              </Button>
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
            </div>
          </div>

          {/* Filters integrated into header */}
          <TrafficFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
        </div>

        {/* Content - Scrollable */}
        <div className='space-y-6 pb-8'>
          {viewMode === 'charts' ? (
            <TrafficCharts incidents={incidents} filters={filters} />
          ) : (
            <TrafficIncidentList incidents={incidents} filters={filters} />
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />
    </PageContainer>
  );
}

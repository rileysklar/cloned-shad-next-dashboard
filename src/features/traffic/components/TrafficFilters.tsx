'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { TrafficIncidentFilters } from '@/types/traffic';
import { useTrafficMetadata } from '../utils';
import { TrafficFiltersSkeleton } from './traffic-filters-skeleton';
import { trafficService } from '../utils/traffic-service';

interface TrafficFiltersProps {
  onFiltersChange: (filters: TrafficIncidentFilters) => void;
  currentFilters: TrafficIncidentFilters;
}

export function TrafficFilters({
  onFiltersChange,
  currentFilters
}: TrafficFiltersProps) {
  const { agencies, issueTypes, loading } = useTrafficMetadata();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof TrafficIncidentFilters,
    value: any
  ) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(currentFilters).some((key) => {
    const value = currentFilters[key as keyof TrafficIncidentFilters];
    if (key === 'date_range') {
      const dateRange = value as { start?: Date; end?: Date } | undefined;
      return dateRange && (dateRange.start || dateRange.end);
    }
    return value !== undefined && value !== 'all';
  });

  if (loading) {
    return <TrafficFiltersSkeleton />;
  }

  return (
    <div className='bg-card rounded-lg border'>
      <div className='flex items-center justify-between p-3'>
        <div className='flex items-center gap-2'>
          <Filter className='text-muted-foreground h-4 w-4' />
          <span className='text-sm font-medium'>Filters</span>

          {/* Date Range Info */}
          {currentFilters.date_range?.start && (
            <span className='rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700'>
              {currentFilters.date_range.start.toLocaleDateString()}
              {currentFilters.date_range.end &&
                ` - ${currentFilters.date_range.end.toLocaleDateString()}`}
            </span>
          )}

          {hasActiveFilters && (
            <span className='bg-primary/10 text-primary rounded-full px-2 py-1 text-xs'>
              {
                Object.keys(currentFilters).filter((key) => {
                  const value =
                    currentFilters[key as keyof TrafficIncidentFilters];
                  if (key === 'date_range') {
                    const dateRange = value as
                      | { start?: Date; end?: Date }
                      | undefined;
                    return dateRange && (dateRange.start || dateRange.end);
                  }
                  return value !== undefined && value !== 'all';
                }).length
              }{' '}
              active
            </span>
          )}
        </div>

        <div className='flex gap-2'>
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={clearFilters}
              className='h-8 px-3'
            >
              <X className='mr-1 h-3 w-3' />
              Clear
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-8 px-3'
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className='p-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Status Filter */}
            <div className='space-y-2'>
              <Label htmlFor='status-filter'>Status</Label>
              <Select
                value={currentFilters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'status',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger id='status-filter'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='ARCHIVED'>Archived</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agency Filter */}
            <div className='space-y-2'>
              <Label htmlFor='agency-filter'>Agency</Label>
              <Select
                value={currentFilters.agency || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'agency',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger id='agency-filter'>
                  <SelectValue placeholder='All Agencies' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Agencies</SelectItem>
                  {agencies?.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Issue Type Filter */}
            <div className='space-y-2'>
              <Label htmlFor='issue-filter'>Issue Type</Label>
              <Select
                value={currentFilters.issue_type || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'issue_type',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger id='issue-filter'>
                  <SelectValue placeholder='All Issues' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Issues</SelectItem>
                  {issueTypes?.map((issue) => (
                    <SelectItem key={issue} value={issue}>
                      {issue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className='space-y-2'>
              <Label htmlFor='date-filter'>Date Range</Label>

              {/* Quick Date Options */}
              <div className='mb-3 flex flex-wrap gap-2'>
                {trafficService.getPredefinedDateRanges().map((range) => (
                  <Button
                    key={range.label}
                    variant='outline'
                    size='sm'
                    onClick={() => handleFilterChange('date_range', range)}
                    className={`h-7 px-2 text-xs ${
                      currentFilters.date_range?.start?.getTime() ===
                        range.start.getTime() &&
                      currentFilters.date_range?.end?.getTime() ===
                        range.end.getTime()
                        ? 'bg-primary text-primary-foreground'
                        : ''
                    }`}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              <div className='flex gap-2'>
                <Input
                  id='date-filter'
                  type='date'
                  value={
                    currentFilters.date_range?.start
                      ?.toISOString()
                      .split('T')[0] || ''
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleFilterChange('date_range', {
                      start: date,
                      end: currentFilters.date_range?.end
                    });
                  }}
                  placeholder='Start Date'
                />
                <Input
                  type='date'
                  value={
                    currentFilters.date_range?.end
                      ?.toISOString()
                      .split('T')[0] || ''
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleFilterChange('date_range', {
                      start: currentFilters.date_range?.start,
                      end: date
                    });
                  }}
                  placeholder='End Date'
                />
              </div>

              {/* Current Date Range Info */}
              {currentFilters.date_range?.start && (
                <div className='text-muted-foreground text-xs'>
                  Showing data from{' '}
                  {currentFilters.date_range.start.toLocaleDateString()}
                  {currentFilters.date_range.end &&
                    ` to ${currentFilters.date_range.end.toLocaleDateString()}`}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='mt-4 border-t pt-4'>
              <Label className='text-sm font-medium'>Active Filters:</Label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {currentFilters.status && currentFilters.status !== 'all' && (
                  <Badge variant='secondary' className='gap-1'>
                    Status: {currentFilters.status}
                    <X
                      className='h-3 w-3 cursor-pointer'
                      onClick={() => handleFilterChange('status', undefined)}
                    />
                  </Badge>
                )}
                {currentFilters.agency && currentFilters.agency !== 'all' && (
                  <Badge variant='secondary' className='gap-1'>
                    Agency: {currentFilters.agency}
                    <X
                      className='h-3 w-3 cursor-pointer'
                      onClick={() => handleFilterChange('agency', undefined)}
                    />
                  </Badge>
                )}
                {currentFilters.issue_type &&
                  currentFilters.issue_type !== 'all' && (
                    <Badge variant='secondary' className='gap-1'>
                      Issue: {currentFilters.issue_type}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() =>
                          handleFilterChange('issue_type', undefined)
                        }
                      />
                    </Badge>
                  )}
                {currentFilters.date_range?.start && (
                  <Badge variant='secondary' className='gap-1'>
                    From: {currentFilters.date_range.start.toLocaleDateString()}
                    <X
                      className='h-3 w-3 cursor-pointer'
                      onClick={() =>
                        handleFilterChange('date_range', undefined)
                      }
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Badge component if not already imported
const Badge = ({ variant, className, children, ...props }: any) => (
  <span
    className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 ${className}`}
    {...props}
  >
    {children}
  </span>
);

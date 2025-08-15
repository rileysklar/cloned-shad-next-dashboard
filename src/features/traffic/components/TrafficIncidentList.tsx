'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  AlertTriangle,
  MapPin,
  Clock,
  Building
} from 'lucide-react';
import { useTrafficIncidents, useTrafficMetadata } from '../utils';
import { TrafficIncidentListSkeleton } from './traffic-incident-list-skeleton';
import { TrafficIncident, TrafficIncidentFilters } from '@/types/traffic';

interface TrafficIncidentListProps {
  incidents: TrafficIncident[];
  filters: TrafficIncidentFilters;
}

export function TrafficIncidentList({
  incidents,
  filters
}: TrafficIncidentListProps) {
  const { loading, error } = useTrafficIncidents();
  const { agencies, issueTypes, stats } = useTrafficMetadata();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(20);

  // Filter incidents based on current filters
  const filteredIncidents = React.useMemo(() => {
    if (!incidents || incidents.length === 0) return [];

    return incidents.filter((incident) => {
      // Status filter
      if (
        filters.status &&
        incident.traffic_report_status.toLowerCase() !==
          filters.status.toLowerCase()
      ) {
        return false;
      }

      // Agency filter
      if (
        filters.agency &&
        incident.agency.toLowerCase() !== filters.agency.toLowerCase()
      ) {
        return false;
      }

      // Issue type filter (check if issue_reported contains the filter text)
      if (
        filters.issue_type &&
        !incident.issue_reported
          .toLowerCase()
          .includes(filters.issue_type.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (filters.date_range) {
        const incidentDate = new Date(incident.published_date);
        if (
          filters.date_range.start &&
          incidentDate < filters.date_range.start
        ) {
          return false;
        }
        if (filters.date_range.end && incidentDate > filters.date_range.end) {
          return false;
        }
      }

      // Bounding box filter (if coordinates are available)
      if (filters.bounding_box) {
        const lat = parseFloat(incident.latitude);
        const lng = parseFloat(incident.longitude);

        if (
          lat < filters.bounding_box.south ||
          lat > filters.bounding_box.north ||
          lng < filters.bounding_box.west ||
          lng > filters.bounding_box.east
        ) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncidents = filteredIncidents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <TrafficIncidentListSkeleton />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <TrafficIncidentListSkeleton />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <AlertTriangle className='h-8 w-8 text-red-600' />
        <span className='ml-2 text-lg text-red-600'>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header with stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{agencies?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Issue Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{issueTypes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground text-sm'>
              {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className='mb-4'>
        <h2 className='text-2xl font-bold'>Traffic Incidents</h2>
        <p className='text-muted-foreground mt-1'>
          Showing {filteredIncidents.length} of {incidents.length} incidents
          {Object.keys(filters).some(
            (key) => filters[key as keyof TrafficIncidentFilters] !== undefined
          ) && <span className='text-primary font-medium'> (filtered)</span>}
          {totalPages > 1 && (
            <span className='text-muted-foreground'>
              {' '}
              • Page {currentPage} of {totalPages}
            </span>
          )}
        </p>
      </div>

      {/* Incidents List */}
      <div className='space-y-4'>
        {currentIncidents.map((incident) => (
          <Card
            key={incident.traffic_report_id}
            className='@container/card transition-shadow hover:shadow-md'
            data-slot='card'
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-lg'>
                    {incident.issue_reported}
                  </CardTitle>
                  <CardDescription className='mt-1 flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    {incident.address}
                  </CardDescription>
                </div>
                <Badge
                  className={getStatusColor(incident.traffic_report_status)}
                >
                  {incident.traffic_report_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='text-muted-foreground grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  <span>Published: {formatDate(incident.published_date)}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Building className='h-4 w-4' />
                  <span>{incident.agency}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  <span>
                    {parseFloat(incident.latitude).toFixed(4)},{' '}
                    {parseFloat(incident.longitude).toFixed(4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='text-muted-foreground text-sm'>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredIncidents.length)} of{' '}
              {filteredIncidents.length} incidents
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className='h-8 w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                  <SelectItem value='100'>100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className='flex items-center gap-1'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentPage(pageNum)}
                    className='h-8 w-10'
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            {totalPages > 10 && (
              <div className='ml-2 flex items-center gap-2'>
                <span className='text-muted-foreground text-sm'>Go to:</span>
                <Input
                  type='number'
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className='h-8 w-16 text-center'
                />
                <span className='text-muted-foreground text-sm'>
                  of {totalPages}
                </span>
              </div>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {filteredIncidents.length === 0 && incidents.length > 0 && (
        <div className='text-muted-foreground py-8 text-center'>
          <div className='space-y-2'>
            <p className='text-lg'>No incidents match the current filters</p>
            <p className='text-sm'>Try adjusting your filter criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}

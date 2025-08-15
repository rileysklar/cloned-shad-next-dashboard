import { useState, useEffect, useCallback } from 'react';
import { TrafficIncident, TrafficIncidentFilters } from '@/types/traffic';
import { trafficService } from './traffic-service';

export interface UseTrafficIncidentsReturn {
  incidents: TrafficIncident[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchWithFilters: (filters: TrafficIncidentFilters) => Promise<void>;
  fetchInBounds: (
    north: number,
    south: number,
    east: number,
    west: number
  ) => Promise<void>;
  fetchByStatus: (status: string) => Promise<void>;
  fetchByAgency: (agency: string) => Promise<void>;
  fetchRecent: () => Promise<void>;
}

export function useTrafficIncidents(): UseTrafficIncidentsReturn {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      console.log('useTrafficIncidents: Starting to fetch incidents...');
      setLoading(true);
      setError(null);
      const data = await trafficService.fetchAllIncidents();
      console.log(
        'useTrafficIncidents: Received data from service:',
        data.length,
        'incidents'
      );
      setIncidents(data);
      console.log('useTrafficIncidents: Set incidents in state:', data.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch incidents'
      );
      console.error('useTrafficIncidents: Error fetching incidents:', err);
    } finally {
      setLoading(false);
      console.log('useTrafficIncidents: Fetch completed, loading set to false');
    }
  }, []);

  const fetchWithFilters = useCallback(
    async (filters: TrafficIncidentFilters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await trafficService.fetchIncidentsWithFilters(filters);
        setIncidents(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch filtered incidents'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchInBounds = useCallback(
    async (north: number, south: number, east: number, west: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await trafficService.fetchIncidentsInBounds(
          north,
          south,
          east,
          west
        );
        setIncidents(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch incidents in bounds'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await trafficService.getIncidentsByStatus(status);
      setIncidents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch incidents by status'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByAgency = useCallback(async (agency: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await trafficService.getIncidentsByAgency(agency);
      setIncidents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch incidents by agency'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trafficService.getRecentIncidents();
      setIncidents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recent incidents'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchIncidents();
  }, [fetchIncidents]);

  // Load initial data
  useEffect(() => {
    console.log(
      'useTrafficIncidents: useEffect triggered, calling fetchIncidents'
    );
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    refresh,
    fetchWithFilters,
    fetchInBounds,
    fetchByStatus,
    fetchByAgency,
    fetchRecent
  };
}

// Hook for getting unique values (agencies, issue types, etc.)
export function useTrafficMetadata() {
  const [agencies, setAgencies] = useState<string[]>([]);
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byAgency: Record<string, number>;
    byIssueType: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [agenciesData, issueTypesData, statsData] = await Promise.all([
        trafficService.getUniqueAgencies(),
        trafficService.getUniqueIssueTypes(),
        trafficService.getIncidentStats()
      ]);

      setAgencies(agenciesData);
      setIssueTypes(issueTypesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    agencies,
    issueTypes,
    stats,
    loading,
    error,
    refresh: fetchMetadata
  };
}

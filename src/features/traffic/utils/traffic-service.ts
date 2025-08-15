import {
  TrafficIncident,
  TrafficIncidentFilters,
  TrafficIncidentResponse
} from '@/types/traffic';

const AUSTIN_TRAFFIC_API_BASE =
  'https://data.austintexas.gov/resource/dx9v-zd7x.json';
const DEFAULT_ORDER = 'published_date DESC'; // Sort by most recent first
const DEFAULT_DAYS_BACK = 7; // Fetch incidents from last 7 days

export class TrafficIncidentService {
  private static instance: TrafficIncidentService;
  private cache: Map<string, { data: TrafficIncident[]; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): TrafficIncidentService {
    if (!TrafficIncidentService.instance) {
      TrafficIncidentService.instance = new TrafficIncidentService();
    }
    return TrafficIncidentService.instance;
  }

  /**
   * Fetch traffic incidents from the last 7 days (most recent first)
   */
  async fetchAllIncidents(): Promise<TrafficIncident[]> {
    try {
      // Temporarily use a much broader date range for testing
      const testDate = new Date('2024-01-01T00:00:00.000Z');

      const whereClause = `published_date >= '${testDate.toISOString()}'`;
      const url = `${AUSTIN_TRAFFIC_API_BASE}?$where=${encodeURIComponent(whereClause)}&$order=${encodeURIComponent(DEFAULT_ORDER)}`;

      console.log('TrafficService: Fetching incidents from:', url);
      console.log('TrafficService: Where clause:', whereClause);
      console.log('TrafficService: Test date:', testDate.toISOString());
      console.log('TrafficService: Current date:', new Date().toISOString());

      const response = await fetch(url);

      console.log('TrafficService: Response status:', response.status);
      console.log('TrafficService: Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      console.log(
        'TrafficService: Raw data received:',
        data.length,
        'incidents'
      );
      console.log('TrafficService: First incident sample:', data[0]);

      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching traffic incidents:', error);
      throw error;
    }
  }

  /**
   * Fetch incidents with filters (limited to 100)
   */
  async fetchIncidentsWithFilters(
    filters: TrafficIncidentFilters
  ): Promise<TrafficIncident[]> {
    try {
      let url = AUSTIN_TRAFFIC_API_BASE;
      const params = new URLSearchParams();
      const whereConditions: string[] = [];

      // Add order parameter
      params.append('$order', DEFAULT_ORDER);

      // Add filters to query parameters
      if (filters.status) {
        params.append('traffic_report_status', filters.status);
      }
      if (filters.agency) {
        params.append('agency', filters.agency);
      }
      if (filters.issue_type) {
        params.append('issue_reported', filters.issue_type);
      }

      // Handle date filtering with proper where clause
      if (filters.date_range) {
        if (filters.date_range.start) {
          whereConditions.push(
            `published_date >= '${filters.date_range.start.toISOString()}'`
          );
        }
        if (filters.date_range.end) {
          whereConditions.push(
            `published_date <= '${filters.date_range.end.toISOString()}'`
          );
        }
      } else {
        // Default to last 7 days if no date filter
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - DEFAULT_DAYS_BACK);
        whereConditions.push(
          `published_date >= '${sevenDaysAgo.toISOString()}'`
        );
      }

      // Add bounding box filter if present
      if (filters.bounding_box) {
        whereConditions.push(
          `latitude <= ${filters.bounding_box.north} AND latitude >= ${filters.bounding_box.south} AND longitude <= ${filters.bounding_box.east} AND longitude >= ${filters.bounding_box.west}`
        );
      }

      // Combine all where conditions
      if (whereConditions.length > 0) {
        const whereClause = whereConditions.join(' AND ');
        params.append('$where', whereClause);
      }

      url += `?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching filtered traffic incidents:', error);
      throw error;
    }
  }

  /**
   * Fetch incidents within a geographic bounding box (limited to 100, most recent first)
   */
  async fetchIncidentsInBounds(
    north: number,
    south: number,
    east: number,
    west: number
  ): Promise<TrafficIncident[]> {
    try {
      const whereClause = `latitude <= ${north} AND latitude >= ${south} AND longitude <= ${east} AND longitude >= ${west}`;
      const url = `${AUSTIN_TRAFFIC_API_BASE}?$where=${encodeURIComponent(whereClause)}&$order=${encodeURIComponent(DEFAULT_ORDER)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents in bounds:', error);
      throw error;
    }
  }

  /**
   * Get incidents by status (limited to 100, most recent first)
   */
  async getIncidentsByStatus(status: string): Promise<TrafficIncident[]> {
    try {
      const url = `${AUSTIN_TRAFFIC_API_BASE}?traffic_report_status=${encodeURIComponent(status)}&$order=${encodeURIComponent(DEFAULT_ORDER)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents by status:', error);
      throw error;
    }
  }

  /**
   * Get incidents by agency (limited to 100, most recent first)
   */
  async getIncidentsByAgency(agency: string): Promise<TrafficIncident[]> {
    try {
      const url = `${AUSTIN_TRAFFIC_API_BASE}?agency=${encodeURIComponent(agency)}&$order=${encodeURIComponent(DEFAULT_ORDER)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents by agency:', error);
      throw error;
    }
  }

  /**
   * Get recent incidents (within the last 24 hours, limited to 100, most recent first)
   */
  async getRecentIncidents(): Promise<TrafficIncident[]> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const whereClause = `published_date >= '${yesterday.toISOString()}'`;
      const url = `${AUSTIN_TRAFFIC_API_BASE}?$where=${encodeURIComponent(whereClause)}&$order=${encodeURIComponent(DEFAULT_ORDER)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrafficIncident[] = await response.json();
      return this.processIncidents(data);
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      throw error;
    }
  }

  /**
   * Process and clean incident data
   */
  private processIncidents(incidents: TrafficIncident[]): TrafficIncident[] {
    return incidents.map((incident) => ({
      ...incident,
      // Parse dates for easier manipulation
      published_date: new Date(incident.published_date).toISOString(),
      traffic_report_status_date_time: new Date(
        incident.traffic_report_status_date_time
      ).toISOString()
    }));
  }

  /**
   * Get unique agencies from incidents
   */
  async getUniqueAgencies(): Promise<string[]> {
    try {
      const incidents = await this.fetchAllIncidents();
      const agencies = Array.from(
        new Set(incidents.map((incident) => incident.agency))
      );
      return agencies.sort();
    } catch (error) {
      console.error('Error fetching unique agencies:', error);
      return [];
    }
  }

  /**
   * Get unique issue types from incidents
   */
  async getUniqueIssueTypes(): Promise<string[]> {
    try {
      const incidents = await this.fetchAllIncidents();
      const issueTypes = Array.from(
        new Set(incidents.map((incident) => incident.issue_reported))
      );
      return issueTypes.sort();
    } catch (error) {
      console.error('Error fetching unique issue types:', error);
      throw error;
    }
  }

  /**
   * Get predefined date ranges for quick filtering
   */
  getPredefinedDateRanges(): Array<{ label: string; start: Date; end: Date }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [
      {
        label: 'Last 7 days',
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      },
      {
        label: 'Last 30 days',
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      },
      {
        label: 'Last 90 days',
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now
      },
      {
        label: 'This month',
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      },
      {
        label: 'Last month',
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      {
        label: 'Year to date',
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      },
      {
        label: 'Last year',
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31)
      }
    ];
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byAgency: Record<string, number>;
    byIssueType: Record<string, number>;
  }> {
    try {
      const incidents = await this.fetchAllIncidents();

      const byStatus = incidents.reduce(
        (acc, incident) => {
          acc[incident.traffic_report_status] =
            (acc[incident.traffic_report_status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const byAgency = incidents.reduce(
        (acc, incident) => {
          acc[incident.agency] = (acc[incident.agency] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const byIssueType = incidents.reduce(
        (acc, incident) => {
          acc[incident.issue_reported] =
            (acc[incident.issue_reported] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total: incidents.length,
        byStatus,
        byAgency,
        byIssueType
      };
    } catch (error) {
      console.error('Error fetching incident statistics:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const trafficService = TrafficIncidentService.getInstance();

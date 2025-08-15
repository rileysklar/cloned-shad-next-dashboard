export interface TrafficIncidentLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface TrafficIncident {
  traffic_report_id: string;
  published_date: string;
  issue_reported: string;
  location: TrafficIncidentLocation;
  latitude: string;
  longitude: string;
  address: string;
  traffic_report_status: string;
  traffic_report_status_date_time: string;
  agency: string;
  '@computed_region_pgdr_vyqg'?: string;
  '@computed_region_u569_ruue'?: string;
  '@computed_region_ap3j_c5bq'?: string;
  '@computed_region_99rk_ypn4'?: string;
  '@computed_region_g44y_bfnm'?: string;
  '@computed_region_jcrc_4uuy'?: string;
  '@computed_region_q9nd_rr82'?: string;
  '@computed_region_e9j2_6w3z'?: string;
  '@computed_region_m2th_e4b7'?: string;
  '@computed_region_rxpj_nzrk'?: string;
}

export interface TrafficIncidentFilters {
  status?: string;
  agency?: string;
  issue_type?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  bounding_box?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface TrafficIncidentResponse {
  data: TrafficIncident[];
  total: number;
  last_updated: string;
}

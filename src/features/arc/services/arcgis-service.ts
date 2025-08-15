export interface ArcGISFeature {
  attributes: Record<string, any>;
  geometry: {
    x?: number;
    y?: number;
    paths?: number[][][];
    rings?: number[][][];
  };
}

export interface ArcGISResponse {
  features: ArcGISFeature[];
  geometryType: string;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
}

export interface ArcGISLayerConfig {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  style: {
    color: string;
    width?: number;
    opacity?: number;
  };
}

export class ArcGISService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.validateServiceConfiguration();
  }

  /**
   * Validate service configuration on initialization
   */
  private validateServiceConfiguration(): void {
    if (!this.baseUrl) {
      throw new Error('ArcGIS Service: Base URL is required');
    }
    
    if (!this.baseUrl.includes('arcgis.com')) {
      console.warn('ArcGIS Service: Base URL may not be a valid ArcGIS service');
    }
    
    if (!this.baseUrl.includes('FeatureServer')) {
      console.warn('ArcGIS Service: Base URL should point to a Feature Server');
    }
  }

  /**
   * Validate layer ID parameter
   */
  private validateLayerId(layerId: number): void {
    if (typeof layerId !== 'number' || layerId < 0) {
      throw new Error(`ArcGIS Service: Invalid layer ID: ${layerId}. Must be a positive number.`);
    }
  }

  /**
   * Validate query options
   */
  private validateQueryOptions(options: any): void {
    if (options.maxRecordCount && (typeof options.maxRecordCount !== 'number' || options.maxRecordCount <= 0)) {
      throw new Error(`ArcGIS Service: Invalid maxRecordCount: ${options.maxRecordCount}. Must be a positive number.`);
    }
    
    if (options.where && typeof options.where !== 'string') {
      throw new Error(`ArcGIS Service: Invalid where clause: ${options.where}. Must be a string.`);
    }
    
    if (options.outFields && typeof options.outFields !== 'string') {
      throw new Error(`ArcGIS Service: Invalid outFields: ${options.outFields}. Must be a string.`);
    }
  }

  /**
   * Validate ArcGIS response data
   */
  private validateArcGISResponse(data: any): void {
    if (!data) {
      throw new Error('ArcGIS Service: No response data received');
    }
    
    if (data.error) {
      throw new Error(`ArcGIS error: ${data.error.message || 'Unknown error'}`);
    }
    
    if (!data.features) {
      throw new Error('ArcGIS Service: Response missing features array');
    }
    
    if (!Array.isArray(data.features)) {
      throw new Error('ArcGIS Service: Features must be an array');
    }
    
    if (!data.geometryType) {
      throw new Error('ArcGIS Service: Response missing geometry type');
    }
    
    if (!data.spatialReference) {
      throw new Error('ArcGIS Service: Response missing spatial reference');
    }
  }

  /**
   * Validate feature structure
   */
  private validateFeature(feature: any, index: number): void {
    if (!feature.attributes) {
      throw new Error(`ArcGIS Service: Feature ${index} missing attributes`);
    }
    
    if (!feature.geometry) {
      throw new Error(`ArcGIS Service: Feature ${index} missing geometry`);
    }
    
    if (typeof feature.attributes.OBJECTID === 'undefined') {
      throw new Error(`ArcGIS Service: Feature ${index} missing OBJECTID attribute`);
    }
  }

  /**
   * Fetch features from an ArcGIS Feature Server layer
   */
  async fetchFeatures(layerId: number, options: {
    where?: string;
    outFields?: string;
    returnGeometry?: boolean;
    maxRecordCount?: number;
  } = {}): Promise<ArcGISResponse> {
    // Validate inputs
    this.validateLayerId(layerId);
    this.validateQueryOptions(options);

    const {
      where = '1=1',
      outFields = '*',
      returnGeometry = true,
      maxRecordCount = 1000
    } = options;

    const params = new URLSearchParams({
      f: 'json',
      where,
      outFields,
      returnGeometry: returnGeometry.toString(),
      maxRecordCount: maxRecordCount.toString()
    });

    const url = `${this.baseUrl}/${layerId}/query?${params.toString()}`;
    
    console.log('ArcGIS Service: Fetching from URL:', url);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response data
      this.validateArcGISResponse(data);
      
      // Validate individual features
      data.features.forEach((feature: any, index: number) => {
        this.validateFeature(feature, index);
      });

      console.log('ArcGIS Service: Successfully fetched data:', {
        featureCount: data.features?.length || 0,
        geometryType: data.geometryType,
        spatialReference: data.spatialReference
      });

      return data;
    } catch (error) {
      console.error('ArcGIS Service: Error fetching features:', error);
      throw error;
    }
  }

  /**
   * Get layer information
   */
  async getLayerInfo(layerId: number): Promise<any> {
    // Validate inputs
    this.validateLayerId(layerId);

    const url = `${this.baseUrl}/${layerId}?f=json`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`ArcGIS error: ${data.error.message || 'Unknown error'}`);
      }

      // Validate layer info
      if (!data.name) {
        throw new Error('ArcGIS Service: Layer info missing name');
      }
      
      if (!data.geometryType) {
        throw new Error('ArcGIS Service: Layer info missing geometry type');
      }
      
      if (typeof data.maxRecordCount !== 'number') {
        throw new Error('ArcGIS Service: Layer info missing max record count');
      }

      return data;
    } catch (error) {
      console.error('ArcGIS Service: Error fetching layer info:', error);
      throw error;
    }
  }

  /**
   * Convert ArcGIS features to GeoJSON format
   */
  convertToGeoJSON(features: ArcGISFeature[], geometryType: string): any {
    // Validate inputs
    if (!Array.isArray(features)) {
      throw new Error('ArcGIS Service: Features must be an array');
    }
    
    if (!geometryType) {
      throw new Error('ArcGIS Service: Geometry type is required');
    }
    
    if (features.length === 0) {
      console.warn('ArcGIS Service: No features to convert');
      return {
        type: 'FeatureCollection',
        features: []
      };
    }

    const convertedFeatures = features.map((feature, index) => {
      try {
        const geometry = this.convertGeometry(feature.geometry, geometryType);
        
        if (!geometry) {
          console.warn(`ArcGIS Service: Could not convert geometry for feature ${index}`);
          return null;
        }

        return {
          type: 'Feature',
          geometry,
          properties: feature.attributes
        };
      } catch (error) {
        console.error(`ArcGIS Service: Error converting feature ${index}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove null features

    const result = {
      type: 'FeatureCollection',
      features: convertedFeatures
    };

    console.log('ArcGIS Service: Converted to GeoJSON:', {
      originalCount: features.length,
      convertedCount: convertedFeatures.length,
      geometryType
    });

    return result;
  }

  private convertGeometry(geometry: any, geometryType: string): any {
    if (!geometry) {
      return null;
    }

    switch (geometryType) {
      case 'esriGeometryPoint':
        if (typeof geometry.x !== 'number' || typeof geometry.y !== 'number') {
          console.warn('ArcGIS Service: Invalid point geometry coordinates');
          return null;
        }
        return {
          type: 'Point',
          coordinates: [geometry.x, geometry.y]
        };
        
      case 'esriGeometryPolyline':
        if (!Array.isArray(geometry.paths) || geometry.paths.length === 0) {
          console.warn('ArcGIS Service: Invalid polyline geometry paths');
          return null;
        }
        return {
          type: 'LineString',
          coordinates: geometry.paths[0] || []
        };
        
      case 'esriGeometryPolygon':
        if (!Array.isArray(geometry.rings) || geometry.rings.length === 0) {
          console.warn('ArcGIS Service: Invalid polygon geometry rings');
          return null;
        }
        return {
          type: 'Polygon',
          coordinates: geometry.rings || []
        };
        
      default:
        console.warn('ArcGIS Service: Unknown geometry type:', geometryType);
        return null;
    }
  }
}

// Create a default instance for the BCBH service
export const bcbhService = new ArcGISService(
  'https://services1.arcgis.com/UN4R3TyArTjDlnhb/arcgis/rest/services/Permian_CCN_External_Open_House/FeatureServer'
);

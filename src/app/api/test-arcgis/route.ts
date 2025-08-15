import { NextResponse } from 'next/server';
import { bcbhService } from '@/features/arc/services/arcgis-service';

export async function GET() {
  try {
    console.log('API: Testing ArcGIS service...');
    
    // Test layer 12 (BCBH preliminary segments)
    const layerId = 12;
    
    // First get layer info
    const layerInfo = await bcbhService.getLayerInfo(layerId);
    console.log('API: Layer info received:', {
      name: layerInfo.name,
      geometryType: layerInfo.geometryType,
      featureCount: layerInfo.maxRecordCount
    });
    
    // Then fetch features
    const features = await bcbhService.fetchFeatures(layerId, {
      maxRecordCount: 10, // Limit to 10 features for testing
      outFields: 'OBJECTID' // Only fetch the ID field to avoid complex queries
    });
    
    // Convert to GeoJSON for easier inspection
    const geoJSON = bcbhService.convertToGeoJSON(features.features, features.geometryType);
    
    const result = {
      success: true,
      layerInfo: {
        name: layerInfo.name,
        geometryType: layerInfo.geometryType,
        maxRecordCount: layerInfo.maxRecordCount
      },
      features: {
        count: features.features.length,
        geometryType: features.geometryType,
        spatialReference: features.spatialReference,
        sample: features.features.slice(0, 3), // Show first 3 features
        geoJSON: geoJSON
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('API: Successfully tested ArcGIS service:', {
      featureCount: features.features.length,
      geometryType: features.geometryType
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API: Error testing ArcGIS service:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

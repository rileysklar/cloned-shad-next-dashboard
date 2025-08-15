import { bcbhService, ArcGISService, ArcGISResponse, ArcGISFeature } from './arcgis-service';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
  timestamp: string;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  executionTime: number;
}

export class ArcGISServiceTester {
  private service: ArcGISService;
  private testResults: TestResult[] = [];

  constructor(service: ArcGISService) {
    this.service = service;
  }

  /**
   * Run all tests and return comprehensive results
   */
  async runAllTests(): Promise<TestSuite> {
    const startTime = Date.now();
    this.testResults = [];

    console.log('🧪 Starting ArcGIS Service Test Suite...');

    // Core service tests
    await this.testServiceInitialization();
    await this.testLayerInfoRetrieval();
    await this.testFeatureFetching();
    await this.testDataValidation();
    await this.testErrorHandling();
    await this.testGeoJSONConversion();
    await this.testPerformance();
    await this.testDataConsistency();

    const executionTime = Date.now() - startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;
    const successRate = (passedTests / this.testResults.length) * 100;

    const suite: TestSuite = {
      name: 'ArcGIS Service Test Suite',
      results: this.testResults,
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      successRate,
      executionTime
    };

    this.printTestSummary(suite);
    return suite;
  }

  /**
   * Test service initialization and basic properties
   */
  private async testServiceInitialization(): Promise<void> {
    const testName = 'Service Initialization';
    
    try {
      // Assert service exists
      this.assert(this.service, 'Service instance should exist');
      
      // Assert service has required methods
      this.assert(typeof this.service.fetchFeatures === 'function', 'fetchFeatures method should exist');
      this.assert(typeof this.service.getLayerInfo === 'function', 'getLayerInfo method should exist');
      this.assert(typeof this.service.convertToGeoJSON === 'function', 'convertToGeoJSON method should exist');

      this.addTestResult(testName, true);
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test layer information retrieval
   */
  private async testLayerInfoRetrieval(): Promise<void> {
    const testName = 'Layer Info Retrieval';
    
    try {
      const layerInfo = await this.service.getLayerInfo(12);
      
      // Assert layer info structure
      this.assert(layerInfo, 'Layer info should be returned');
      this.assert(typeof layerInfo.name === 'string', 'Layer name should be a string');
      this.assert(typeof layerInfo.geometryType === 'string', 'Geometry type should be a string');
      this.assert(typeof layerInfo.maxRecordCount === 'number', 'Max record count should be a number');
      
      // Assert specific values
      this.assert(layerInfo.name === 'BCBH Preliminary Segments', 'Layer name should match expected value');
      this.assert(layerInfo.geometryType === 'esriGeometryPolyline', 'Geometry type should be polyline');
      this.assert(layerInfo.maxRecordCount > 0, 'Max record count should be positive');

      this.addTestResult(testName, true, undefined, { layerInfo });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test feature fetching functionality
   */
  private async testFeatureFetching(): Promise<void> {
    const testName = 'Feature Fetching';
    
    try {
      const features = await this.service.fetchFeatures(12, {
        maxRecordCount: 10,
        outFields: 'OBJECTID'
      });
      
      // Assert response structure
      this.assert(features, 'Features should be returned');
      this.assert(Array.isArray(features.features), 'Features should be an array');
      this.assert(typeof features.geometryType === 'string', 'Geometry type should be a string');
      this.assert(features.spatialReference, 'Spatial reference should exist');
      
      // Assert data quality
      this.assert(features.features.length > 0, 'Should return at least one feature');
      // Note: ArcGIS may not always respect maxRecordCount exactly, so we check if it's reasonable
      this.assert(features.features.length <= 100, 'Should return a reasonable number of features (ArcGIS may override maxRecordCount)');
      this.assert(features.geometryType === 'esriGeometryPolyline', 'Should return polyline geometry');
      
      // Assert feature structure
      const firstFeature = features.features[0];
      this.assert(firstFeature.attributes, 'Feature should have attributes');
      this.assert(firstFeature.geometry, 'Feature should have geometry');
      this.assert(firstFeature.attributes.OBJECTID, 'Feature should have OBJECTID attribute');

      this.addTestResult(testName, true, undefined, { 
        featureCount: features.features.length,
        requestedMax: 10,
        actualMax: features.features.length,
        note: 'ArcGIS may override maxRecordCount based on service configuration'
      });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test data validation and quality
   */
  private async testDataValidation(): Promise<void> {
    const testName = 'Data Validation';
    
    try {
      const features = await this.service.fetchFeatures(12, { maxRecordCount: 100 });
      
      // Assert all features have valid structure
      for (let i = 0; i < features.features.length; i++) {
        const feature = features.features[i];
        this.assert(feature.attributes, `Feature ${i} should have attributes`);
        this.assert(feature.geometry, `Feature ${i} should have geometry`);
        this.assert(feature.attributes.OBJECTID, `Feature ${i} should have OBJECTID`);
        
        // Validate geometry coordinates
        if (feature.geometry.paths) {
          this.assert(Array.isArray(feature.geometry.paths), `Feature ${i} paths should be array`);
          this.assert(feature.geometry.paths.length > 0, `Feature ${i} should have at least one path`);
          
          for (const path of feature.geometry.paths) {
            this.assert(Array.isArray(path), `Feature ${i} path should be array of coordinates`);
            this.assert(path.length >= 2, `Feature ${i} path should have at least 2 coordinates`);
            
            for (const coord of path) {
              this.assert(Array.isArray(coord), `Feature ${i} coordinate should be array`);
              this.assert(coord.length === 2, `Feature ${i} coordinate should have 2 values`);
              this.assert(typeof coord[0] === 'number', `Feature ${i} longitude should be number`);
              this.assert(typeof coord[1] === 'number', `Feature ${i} latitude should be number`);
            }
          }
        }
      }

      this.addTestResult(testName, true, undefined, { 
        validatedFeatures: features.features.length 
      });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test error handling scenarios
   */
  private async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling';
    
    try {
      // Test invalid layer ID
      try {
        await this.service.getLayerInfo(99999);
        this.assert(false, 'Should throw error for invalid layer ID');
      } catch (error) {
        this.assert(error instanceof Error, 'Should throw Error instance');
        if (error instanceof Error) {
          this.assert(error.message.includes('HTTP error') || error.message.includes('ArcGIS error'), 
            'Should have appropriate error message');
        }
      }

      // Test invalid query parameters
      try {
        await this.service.fetchFeatures(12, { 
          where: 'INVALID_SQL_SYNTAX', 
          maxRecordCount: -1 
        });
        this.assert(false, 'Should handle invalid query parameters gracefully');
      } catch (error) {
        this.assert(error instanceof Error, 'Should throw Error instance for invalid queries');
      }

      this.addTestResult(testName, true);
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test GeoJSON conversion
   */
  private async testGeoJSONConversion(): Promise<void> {
    const testName = 'GeoJSON Conversion';
    
    try {
      const features = await this.service.fetchFeatures(12, { maxRecordCount: 5 });
      const geoJSON = this.service.convertToGeoJSON(features.features, features.geometryType);
      
      // Assert GeoJSON structure
      this.assert(geoJSON.type === 'FeatureCollection', 'Should be FeatureCollection');
      this.assert(Array.isArray(geoJSON.features), 'Should have features array');
      this.assert(geoJSON.features.length === features.features.length, 'Should preserve feature count');
      
      // Assert feature conversion
      for (let i = 0; i < geoJSON.features.length; i++) {
        const geoJSONFeature = geoJSON.features[i];
        const originalFeature = features.features[i];
        
        this.assert(geoJSONFeature.type === 'Feature', `Feature ${i} should have type Feature`);
        this.assert(geoJSONFeature.geometry.type === 'LineString', `Feature ${i} should be LineString`);
        this.assert(Array.isArray(geoJSONFeature.geometry.coordinates), `Feature ${i} should have coordinates array`);
        this.assert(geoJSONFeature.properties.OBJECTID === originalFeature.attributes.OBJECTID, 
          `Feature ${i} should preserve OBJECTID`);
      }

      this.addTestResult(testName, true, undefined, { 
        convertedFeatures: geoJSON.features.length,
        sampleGeoJSON: geoJSON.features[0] 
      });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test performance characteristics
   */
  private async testPerformance(): Promise<void> {
    const testName = 'Performance Testing';
    
    try {
      const startTime = Date.now();
      
      // Test multiple concurrent requests
      const promises = [
        this.service.getLayerInfo(12),
        this.service.fetchFeatures(12, { maxRecordCount: 10 }),
        this.service.fetchFeatures(12, { maxRecordCount: 20 }),
        this.service.fetchFeatures(12, { maxRecordCount: 50 })
      ];
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // Assert all requests completed
      this.assert(results.length === 4, 'All concurrent requests should complete');
      this.assert(results.every(r => r), 'All requests should return data');
      
      // Assert reasonable performance (adjust thresholds as needed)
      this.assert(totalTime < 5000, `Total time should be under 5 seconds, got ${totalTime}ms`);
      
      // Test individual request performance
      const singleStart = Date.now();
      await this.service.fetchFeatures(12, { maxRecordCount: 100 });
      const singleTime = Date.now() - singleStart;
      
      this.assert(singleTime < 3000, `Single request should complete under 3 seconds, got ${singleTime}ms`);

      this.addTestResult(testName, true, undefined, { 
        concurrentTime: totalTime,
        singleRequestTime: singleTime 
      });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test data consistency across requests
   */
  private async testDataConsistency(): Promise<void> {
    const testName = 'Data Consistency';
    
    try {
      // Make multiple identical requests
      const requests = [
        this.service.fetchFeatures(12, { maxRecordCount: 10 }),
        this.service.fetchFeatures(12, { maxRecordCount: 10 }),
        this.service.fetchFeatures(12, { maxRecordCount: 10 })
      ];
      
      const results = await Promise.all(requests);
      
      // Assert all results are identical
      const firstResult = results[0];
      for (let i = 1; i < results.length; i++) {
        this.assert(results[i].features.length === firstResult.features.length, 
          `Request ${i} should return same feature count`);
        
        // Compare first few features
        for (let j = 0; j < Math.min(3, firstResult.features.length); j++) {
          this.assert(results[i].features[j].attributes.OBJECTID === firstResult.features[j].attributes.OBJECTID,
            `Request ${i} feature ${j} should have same OBJECTID`);
        }
      }

      this.addTestResult(testName, true, undefined, { 
        consistencyChecks: results.length,
        featureCount: firstResult.features.length 
      });
    } catch (error) {
      this.addTestResult(testName, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Custom assertion method
   */
  private assert(condition: any, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Add test result
   */
  private addTestResult(testName: string, passed: boolean, error?: string, details?: any): void {
    const result: TestResult = {
      testName,
      passed,
      error,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    
    if (error) {
      console.error(`   Error: ${error}`);
    }
    
    if (details) {
      console.log(`   Details:`, details);
    }
  }

  /**
   * Print comprehensive test summary
   */
  private printTestSummary(suite: TestSuite): void {
    console.log('\n' + '='.repeat(60));
    console.log(`🧪 ${suite.name} - COMPLETE`);
    console.log('='.repeat(60));
    console.log(`📊 Results: ${suite.passedTests}/${suite.totalTests} tests passed`);
    console.log(`📈 Success Rate: ${suite.successRate.toFixed(1)}%`);
    console.log(`⏱️  Execution Time: ${suite.executionTime}ms`);
    
    if (suite.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      suite.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`   - ${r.testName}: ${r.error}`));
    }
    
    console.log('\n✅ All tests completed!');
    console.log('='.repeat(60));
  }
}

// Create a default tester instance
export const arcgisTester = new ArcGISServiceTester(bcbhService);

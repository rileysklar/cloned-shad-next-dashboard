import { NextResponse } from 'next/server';
import { arcgisTester } from '@/features/arc/services/arcgis-service-tester';

export async function GET() {
  try {
    console.log('🧪 API: Starting comprehensive ArcGIS service testing...');
    
    // Run all tests
    const testSuite = await arcgisTester.runAllTests();
    
    // Return comprehensive results
    const result = {
      success: true,
      testSuite,
      summary: {
        status: testSuite.successRate === 100 ? 'PASSED' : 'FAILED',
        message: testSuite.successRate === 100 
          ? 'All tests passed! Service is working correctly.'
          : `${testSuite.failedTests} tests failed. Service needs attention.`,
        recommendation: testSuite.successRate === 100
          ? 'Service is ready for production use.'
          : 'Review failed tests and fix issues before production deployment.'
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('🧪 API: Comprehensive testing completed:', {
      status: result.summary.status,
      successRate: testSuite.successRate,
      executionTime: testSuite.executionTime
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('🧪 API: Error during comprehensive testing:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

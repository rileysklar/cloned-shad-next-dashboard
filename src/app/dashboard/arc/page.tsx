'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { TestSuite } from '@/features/arc';
import { useThemeConfig } from '@/components/active-theme';

export default function ArcDashboardPage() {
  const [testResults, setTestResults] = useState<TestSuite | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const { activeTheme } = useThemeConfig();

  const runComprehensiveTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-arcgis-comprehensive');
      const data = await response.json();

      if (data.success) {
        setTestResults(data.testSuite);
        setLastRun(new Date().toLocaleString());
        console.log('🧪 Test results:', data);
      } else {
        console.error('Testing failed:', data.error);
        setTestResults(null);
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  // Theme-aware classes
  const themeClasses = {
    container: 'mx-auto min-h-0 w-full max-w-7xl space-y-6',
    title: 'text-3xl font-bold tracking-tight',
    subtitle: 'text-muted-foreground',
    summaryCard: 'text-center p-4 bg-muted rounded-lg',
    summaryValue: 'text-2xl font-bold',
    summaryLabel: 'text-sm text-muted-foreground',
    successValue: 'text-green-600',
    failedValue: 'text-red-600',
    testCard: 'p-3 rounded-lg border',
    testCardPassed: 'border-green-200',
    testCardFailed: 'border-red-200',
    testError: 'mt-2 text-sm text-red-600',
    testDetails: 'mt-2 text-xs text-muted-foreground',
    detailsSummary: 'cursor-pointer hover:text-foreground',
    detailsContent: 'mt-2 p-2 bg-muted rounded text-xs overflow-auto'
  };

  return (
    <PageContainer className="p-4 md:px-6">
      <div className={themeClasses.container}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={themeClasses.title}>ArcGIS Service Testing</h1>
            <p className={themeClasses.subtitle}>
              Comprehensive testing and validation of the ArcGIS service
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Service Test Suite
              {lastRun && (
                <span className="text-sm text-muted-foreground font-normal">
                  Last run: {lastRun}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runComprehensiveTests}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Running Tests...' : '🚀 Run Comprehensive Tests'}
            </Button>

            {testResults && (
              <div className="space-y-6">
                {/* Test Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={themeClasses.summaryCard}>
                    <div className={themeClasses.summaryValue}>{testResults.totalTests}</div>
                    <div className={themeClasses.summaryLabel}>Total Tests</div>
                  </div>
                  <div className={themeClasses.summaryCard}>
                    <div className={`${themeClasses.summaryValue} ${themeClasses.successValue}`}>
                      {testResults.passedTests}
                    </div>
                    <div className={themeClasses.summaryLabel}>Passed</div>
                  </div>
                  <div className={themeClasses.summaryCard}>
                    <div className={`${themeClasses.summaryValue} ${themeClasses.failedValue}`}>
                      {testResults.failedTests}
                    </div>
                    <div className={themeClasses.summaryLabel}>Failed</div>
                  </div>
                  <div className={themeClasses.summaryCard}>
                    <div className={themeClasses.summaryValue}>
                      {testResults.successRate.toFixed(1)}%
                    </div>
                    <div className={themeClasses.summaryLabel}>Success Rate</div>
                  </div>
                </div>

                {/* Overall Status */}
                <div className="text-center">
                  <Badge
                    className={`text-white px-4 py-2 text-lg ${getStatusColor(
                      testResults.successRate === 100 ? 'PASSED' : 'FAILED'
                    )}`}
                  >
                    {testResults.successRate === 100 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    Execution time: {testResults.executionTime}ms
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Test Results:</h3>
                  {testResults.results.map((result, index) => (
                    <div
                      key={index}
                      className={`${themeClasses.testCard} ${
                        result.passed ? themeClasses.testCardPassed : themeClasses.testCardFailed
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTestStatusIcon(result.passed)}</span>
                          <span className="font-medium">{result.testName}</span>
                        </div>
                        <Badge variant={result.passed ? 'default' : 'destructive'}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>

                      {result.error && (
                        <div className={themeClasses.testError}>
                          Error: {result.error}
                        </div>
                      )}

                      {result.details && (
                        <div className={themeClasses.testDetails}>
                          <details>
                            <summary className={themeClasses.detailsSummary}>
                              View Details
                            </summary>
                            <pre className={themeClasses.detailsContent}>
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

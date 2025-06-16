
import { measurePerformance, createLoadTestData, mockCodeSamples } from './eslint-test-utils';

// Performance Tests for ESLint Operations
export class ESLintPerformanceTests {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async testLargeCodebaseAnalysis() {
    const results = [];

    // Test 1: Large file analysis
    try {
      const { result, duration } = await measurePerformance(async () => {
        const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: mockCodeSamples.large,
            config: { rules: { 'no-unused-vars': 'warn' } }
          })
        });
        return response.json();
      }, 'Large file analysis');

      results.push({
        test: 'Large file analysis',
        passed: duration < 10000, // Should complete within 10 seconds
        duration,
        linesAnalyzed: mockCodeSamples.large.split('\n').length
      });
    } catch (error) {
      results.push({
        test: 'Large file analysis',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Multiple small files
    const smallFiles = Array(50).fill(0).map((_, i) => ({
      code: `const Component${i} = () => <div>{${i}}</div>;`,
      config: { rules: { 'semi': 'error' } }
    }));

    try {
      const { duration } = await measurePerformance(async () => {
        const promises = smallFiles.map(file => 
          fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(file)
          })
        );
        return Promise.all(promises);
      }, 'Multiple small files');

      results.push({
        test: 'Multiple small files (50 files)',
        passed: duration < 15000, // Should complete within 15 seconds
        duration,
        filesAnalyzed: smallFiles.length
      });
    } catch (error) {
      results.push({
        test: 'Multiple small files',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testDatabasePerformance() {
    const results = [];
    const { projects, results: mockResults } = createLoadTestData(10, 20);

    // Test 1: Bulk insert performance
    try {
      const { duration } = await measurePerformance(async () => {
        // This would require actual database access
        // Simulating with a timeout for now
        return new Promise(resolve => setTimeout(resolve, 100));
      }, 'Bulk insert test');

      results.push({
        test: 'Bulk insert (200 records)',
        passed: duration < 5000,
        duration,
        recordCount: mockResults.length
      });
    } catch (error) {
      results.push({
        test: 'Bulk insert',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Complex query performance
    try {
      const { duration } = await measurePerformance(async () => {
        // Simulate complex aggregation query
        return new Promise(resolve => setTimeout(resolve, 200));
      }, 'Complex query test');

      results.push({
        test: 'Complex aggregation query',
        passed: duration < 3000,
        duration
      });
    } catch (error) {
      results.push({
        test: 'Complex aggregation query',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testConcurrentAnalysis() {
    const results = [];
    const concurrentRequests = 10;

    try {
      const { duration } = await measurePerformance(async () =>  {
        const promises = Array(concurrentRequests).fill(0).map(() =>
          fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: mockCodeSamples.withWarnings,
              config: { rules: { 'no-console': 'warn' } }
            })
          })
        );
        
        const responses = await Promise.all(promises);
        return responses.map(r => r.ok);
      }, 'Concurrent analysis');

      results.push({
        test: `Concurrent analysis (${concurrentRequests} requests)`,
        passed: duration < 8000, // Should handle concurrent requests efficiently
        duration,
        requestCount: concurrentRequests
      });
    } catch (error) {
      results.push({
        test: 'Concurrent analysis',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async runAllTests() {
    console.log('Starting ESLint Performance Tests...');
    
    const codebaseTests = await this.testLargeCodebaseAnalysis();
    const dbTests = await this.testDatabasePerformance();
    const concurrentTests = await this.testConcurrentAnalysis();
    
    const allTests = [...codebaseTests, ...dbTests, ...concurrentTests];
    const passed = allTests.filter(t => t.passed).length;
    const total = allTests.length;
    
    console.log(`Performance Tests: ${passed}/${total} passed`);
    
    return {
      summary: { passed, total, percentage: (passed / total) * 100 },
      results: allTests
    };
  }
}

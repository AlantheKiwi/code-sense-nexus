
import { ESLintUnitTests } from './eslint-unit-tests';
import { ESLintIntegrationTests } from './eslint-integration-tests';
import { ESLintPerformanceTests } from './eslint-performance-tests';
import { ESLintLoadTests } from './eslint-load-tests';

// Main Test Runner for ESLint Testing Suite
export class ESLintTestRunner {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://dtwgnqzuskdfuypigaor.supabase.co';
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive ESLint Test Suite...\n');
    
    const startTime = Date.now();
    const results = {
      unit: null,
      integration: null,
      performance: null,
      load: null,
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        duration: 0,
        overallPercentage: 0
      }
    };

    try {
      // Run Unit Tests
      console.log('📋 Running Unit Tests...');
      const unitTests = new ESLintUnitTests(this.baseUrl);
      results.unit = await unitTests.runAllTests();
      
      // Run Integration Tests
      console.log('\n🔗 Running Integration Tests...');
      const integrationTests = new ESLintIntegrationTests();
      results.integration = await integrationTests.runAllTests();
      
      // Run Performance Tests
      console.log('\n⚡ Running Performance Tests...');
      const performanceTests = new ESLintPerformanceTests(this.baseUrl);
      results.performance = await performanceTests.runAllTests();
      
      // Run Load Tests
      console.log('\n📈 Running Load Tests...');
      const loadTests = new ESLintLoadTests(this.baseUrl);
      results.load = await loadTests.runLoadTests();
      
    } catch (error) {
      console.error('Test suite error:', error);
    }

    // Calculate overall summary
    const endTime = Date.now();
    results.summary.duration = endTime - startTime;
    
    const summaries = [
      results.unit?.summary,
      results.integration?.summary,
      results.performance?.summary,
      results.load?.summary
    ].filter(Boolean);
    
    results.summary.totalTests = summaries.reduce((sum, s) => sum + s.total, 0);
    results.summary.totalPassed = summaries.reduce((sum, s) => sum + s.passed, 0);
    results.summary.totalFailed = results.summary.totalTests - results.summary.totalPassed;
    results.summary.overallPercentage = (results.summary.totalPassed / results.summary.totalTests) * 100;

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESLINT TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.totalPassed} (${results.summary.overallPercentage.toFixed(1)}%)`);
    console.log(`Failed: ${results.summary.totalFailed}`);
    console.log(`Duration: ${(results.summary.duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (results.unit) {
      console.log(`Unit Tests: ${results.unit.summary.passed}/${results.unit.summary.total} (${results.unit.summary.percentage.toFixed(1)}%)`);
    }
    if (results.integration) {
      console.log(`Integration Tests: ${results.integration.summary.passed}/${results.integration.summary.total} (${results.integration.summary.percentage.toFixed(1)}%)`);
    }
    if (results.performance) {
      console.log(`Performance Tests: ${results.performance.summary.passed}/${results.performance.summary.total} (${results.performance.summary.percentage.toFixed(1)}%)`);
    }
    if (results.load) {
      console.log(`Load Tests: ${results.load.summary.passed}/${results.load.summary.total} (${results.load.summary.percentage.toFixed(1)}%)`);
    }

    return results;
  }

  // Run specific test categories
  async runUnitTestsOnly() {
    const unitTests = new ESLintUnitTests(this.baseUrl);
    return unitTests.runAllTests();
  }

  async runIntegrationTestsOnly() {
    const integrationTests = new ESLintIntegrationTests();
    return integrationTests.runAllTests();
  }

  async runPerformanceTestsOnly() {
    const performanceTests = new ESLintPerformanceTests(this.baseUrl);
    return performanceTests.runAllTests();
  }

  async runLoadTestsOnly() {
    const loadTests = new ESLintLoadTests(this.baseUrl);
    return loadTests.runLoadTests();
  }
}

// Export for use in development/testing
export const runESLintTests = async () => {
  const runner = new ESLintTestRunner();
  return runner.runAllTests();
};

// Console command for manual testing
if (typeof window !== 'undefined') {
  (window as any).runESLintTests = runESLintTests;
  console.log('ESLint Test Suite loaded. Run runESLintTests() to start comprehensive testing.');
}

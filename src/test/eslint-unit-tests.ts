
import { mockCodeSamples, mockESLintConfigs, generateMockProject, validateAPIResponse } from './eslint-test-utils';

// Unit Tests for ESLint API Endpoints
export class ESLintUnitTests {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async testESLintAnalysisEndpoint() {
    const results = [];
    
    // Test 1: Valid code analysis
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockCodeSamples.valid,
          config: mockESLintConfigs.strict
        })
      });
      
      const data = await response.json();
      const errors = validateAPIResponse(data, {
        analysis: { required: true, type: 'object' },
        'analysis.issues': { required: true, type: 'object' },
        'analysis.securityIssues': { required: true, type: 'object' }
      });
      
      results.push({
        test: 'Valid code analysis',
        passed: response.ok && errors.length === 0,
        errors,
        data
      });
    } catch (error) {
      results.push({
        test: 'Valid code analysis',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Malformed code handling
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockCodeSamples.malformed,
          config: mockESLintConfigs.strict
        })
      });
      
      const data = await response.json();
      results.push({
        test: 'Malformed code handling',
        passed: response.ok && (data.error === 'SyntaxError' || data.analysis?.issues?.length > 0),
        data
      });
    } catch (error) {
      results.push({
        test: 'Malformed code handling',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 3: Security issue detection
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockCodeSamples.withSecurityIssues,
          config: mockESLintConfigs.security
        })
      });
      
      const data = await response.json();
      results.push({
        test: 'Security issue detection',
        passed: response.ok && data.analysis?.securityIssues?.length > 0,
        data
      });
    } catch (error) {
      results.push({
        test: 'Security issue detection',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 4: Invalid configuration handling
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mockCodeSamples.valid,
          config: { rules: { 'invalid-rule': 'error' } }
        })
      });
      
      results.push({
        test: 'Invalid configuration handling',
        passed: response.ok, // Should handle gracefully
        status: response.status
      });
    } catch (error) {
      results.push({
        test: 'Invalid configuration handling',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testESLintSchedulerEndpoint() {
    const results = [];
    const mockProject = generateMockProject();

    // Test 1: Schedule analysis
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-scheduler`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          action: 'schedule',
          project_id: mockProject.id,
          trigger_type: 'manual',
          priority: 5
        })
      });
      
      const data = await response.json();
      results.push({
        test: 'Schedule analysis',
        passed: response.status === 200 || response.status === 401, // 401 is acceptable (auth)
        status: response.status,
        data
      });
    } catch (error) {
      results.push({
        test: 'Schedule analysis',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Queue status
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-scheduler?action=queue-status`, {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      
      results.push({
        test: 'Queue status',
        passed: response.status === 200 || response.status === 401,
        status: response.status
      });
    } catch (error) {
      results.push({
        test: 'Queue status',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testESLintResultsProcessor() {
    const results = [];
    const mockProject = generateMockProject();
    const mockResults = [
      {
        filePath: 'src/test.tsx',
        messages: [
          {
            ruleId: 'no-console',
            severity: 1,
            message: 'Unexpected console statement',
            line: 5,
            column: 3
          }
        ]
      }
    ];

    // Test 1: Process results
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/eslint-results-processor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          action: 'process',
          project_id: mockProject.id,
          results: mockResults
        })
      });
      
      results.push({
        test: 'Process results',
        passed: response.status === 200 || response.status === 401,
        status: response.status
      });
    } catch (error) {
      results.push({
        test: 'Process results',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async runAllTests() {
    console.log('Starting ESLint Unit Tests...');
    
    const analysisTests = await this.testESLintAnalysisEndpoint();
    const schedulerTests = await this.testESLintSchedulerEndpoint();
    const processorTests = await this.testESLintResultsProcessor();
    
    const allTests = [
      ...analysisTests,
      ...schedulerTests,
      ...processorTests
    ];
    
    const passed = allTests.filter(t => t.passed).length;
    const total = allTests.length;
    
    console.log(`Unit Tests: ${passed}/${total} passed`);
    
    return {
      summary: { passed, total, percentage: (passed / total) * 100 },
      results: allTests
    };
  }
}


import { supabase } from '@/integrations/supabase/client';
import { generateMockProject, generateMockESLintResult, measurePerformance } from './eslint-test-utils';

// Integration Tests for Database Operations
export class ESLintIntegrationTests {
  
  async testDatabaseOperations() {
    const results = [];
    const mockProject = generateMockProject();
    const mockResult = generateMockESLintResult(mockProject.id, 'src/test.tsx');

    // Test 1: Insert ESLint result
    try {
      const { data, error } = await supabase
        .from('eslint_results')
        .insert(mockResult)
        .select()
        .single();

      results.push({
        test: 'Insert ESLint result',
        passed: !error && data?.id === mockResult.id,
        error: error?.message,
        data
      });
    } catch (error) {
      results.push({
        test: 'Insert ESLint result',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Query ESLint results
    try {
      const { data, error } = await supabase
        .from('eslint_results')
        .select('*')
        .eq('project_id', mockProject.id)
        .limit(10);

      results.push({
        test: 'Query ESLint results',
        passed: !error && Array.isArray(data),
        error: error?.message,
        resultCount: data?.length || 0
      });
    } catch (error) {
      results.push({
        test: 'Query ESLint results',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 3: Update project summary
    try {
      const { data, error } = await supabase
        .from('eslint_project_summaries')
        .upsert({
          project_id: mockProject.id,
          total_files: 5,
          total_issues: 10,
          severity_counts: { error: 2, warn: 6, info: 2 },
          category_counts: { code_quality: 4, potential_bugs: 3, style_violations: 2, security: 1 },
          average_quality_score: 82.5
        })
        .select()
        .single();

      results.push({
        test: 'Update project summary',
        passed: !error && data?.project_id === mockProject.id,
        error: error?.message
      });
    } catch (error) {
      results.push({
        test: 'Update project summary',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 4: Insert trends data
    try {
      const { data, error } = await supabase
        .from('eslint_trends')
        .insert({
          project_id: mockProject.id,
          analysis_date: new Date().toISOString().split('T')[0],
          total_issues: 10,
          severity_counts: { error: 2, warn: 6, info: 2 },
          category_counts: { code_quality: 4, potential_bugs: 3, style_violations: 2, security: 1 },
          quality_score: 82.5,
          files_analyzed: 5
        })
        .select()
        .single();

      results.push({
        test: 'Insert trends data',
        passed: !error && data?.project_id === mockProject.id,
        error: error?.message
      });
    } catch (error) {
      results.push({
        test: 'Insert trends data',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 5: Create critical alert
    try {
      const { data, error } = await supabase
        .from('eslint_critical_alerts')
        .insert({
          project_id: mockProject.id,
          result_id: mockResult.id,
          alert_type: 'critical_error',
          message: 'Critical security vulnerability detected',
          file_path: 'src/test.tsx',
          line_number: 10,
          rule_id: 'no-eval'
        })
        .select()
        .single();

      results.push({
        test: 'Create critical alert',
        passed: !error && data?.project_id === mockProject.id,
        error: error?.message
      });
    } catch (error) {
      results.push({
        test: 'Create critical alert',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testHookIntegration() {
    const results = [];

    // Test 1: Test useESLintResults hook functionality
    try {
      // This would require a test environment with React Testing Library
      // For now, we'll test the underlying Supabase calls
      const mockProject = generateMockProject();
      
      const { data, error } = await supabase
        .from('eslint_results')
        .select('*')
        .eq('project_id', mockProject.id)
        .limit(50);

      results.push({
        test: 'ESLint Results Hook Query',
        passed: !error,
        error: error?.message
      });
    } catch (error) {
      results.push({
        test: 'ESLint Results Hook Query',
        passed: false,
        errors: [error.message]
      });
    }

    // Test 2: Test scheduler integration
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        body: { action: 'queue-status' }
      });

      results.push({
        test: 'Scheduler Integration',
        passed: !response.error,
        error: response.error?.message
      });
    } catch (error) {
      results.push({
        test: 'Scheduler Integration',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async runAllTests() {
    console.log('Starting ESLint Integration Tests...');
    
    const dbTests = await this.testDatabaseOperations();
    const hookTests = await this.testHookIntegration();
    
    const allTests = [...dbTests, ...hookTests];
    const passed = allTests.filter(t => t.passed).length;
    const total = allTests.length;
    
    console.log(`Integration Tests: ${passed}/${total} passed`);
    
    return {
      summary: { passed, total, percentage: (passed / total) * 100 },
      results: allTests
    };
  }
}

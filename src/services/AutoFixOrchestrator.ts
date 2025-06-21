
import { AutoFixActions } from '@/contexts/AutoFixContext';
import { supabase } from '@/integrations/supabase/client';

export class AutoFixOrchestrator {
  private actions: AutoFixActions;
  private isRunning = false;

  constructor(actions: AutoFixActions) {
    this.actions = actions;
    console.log('AutoFixOrchestrator initialized');
  }

  async runESLintAnalysis(projectId: string, code?: string, useRealAnalysis: boolean = false): Promise<void> {
    console.log('Starting ESLint analysis for project:', projectId, 'Real mode:', useRealAnalysis);
    
    if (this.isRunning) {
      console.log('Analysis already in progress, aborting');
      this.actions.addError('Analysis already in progress');
      return;
    }

    this.isRunning = true;
    this.actions.startAnalysis('ESLint');

    try {
      if (useRealAnalysis) {
        await this.runRealESLintAnalysis(projectId, code);
      } else {
        await this.runMockESLintAnalysis(projectId, code);
      }
    } catch (error: any) {
      console.error('ESLint analysis error:', error);
      this.actions.addError(`ESLint analysis failed: ${error.message}`);
      
      // Fallback to mock if real analysis fails
      if (useRealAnalysis) {
        console.log('Real analysis failed, falling back to mock');
        this.actions.addError('Real analysis failed, using mock fallback');
        try {
          await this.runMockESLintAnalysis(projectId, code);
        } catch (mockError: any) {
          console.error('Mock fallback also failed:', mockError);
          this.actions.addError(`Mock fallback failed: ${mockError.message}`);
        }
      }
    } finally {
      this.actions.stopAnalysis();
      this.isRunning = false;
      console.log('ESLint analysis completed');
    }
  }

  private async runRealESLintAnalysis(projectId: string, code?: string): Promise<void> {
    console.log('Running REAL ESLint analysis for project:', projectId);
    
    try {
      // Update progress
      this.actions.setProgress(10);
      
      // Call the eslint-scheduler edge function
      console.log('Calling eslint-scheduler edge function...');
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('eslint-scheduler', {
          body: {
            action: 'schedule',
            project_id: projectId,
            trigger_type: 'manual',
            trigger_data: { 
              code: code || 'No code provided',
              source: 'auto-fix-panel'
            },
            priority: 1
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout (30s)')), 30000)
        )
      ]) as any;

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      this.actions.setProgress(50);
      console.log('ESLint scheduler response:', data);

      // Simulate waiting for analysis completion
      await this.simulateAnalysis('Real ESLint Processing', [
        { progress: 60, message: 'Job queued successfully...' },
        { progress: 80, message: 'Analysis in progress...' },
        { progress: 100, message: 'Real ESLint analysis complete' }
      ]);

      // Create result based on real response
      const realResult = {
        tool: 'ESLint (Real)',
        issues: data?.job ? [
          { severity: 'info', message: `Job ${data.job.id} scheduled successfully`, line: 1 },
          { severity: 'info', message: `Status: ${data.job.status}`, line: 2 },
          { severity: 'info', message: `Priority: ${data.job.priority}`, line: 3 }
        ] : [
          { severity: 'info', message: 'Real analysis scheduled', line: 1 }
        ],
        summary: data?.success ? 'Real analysis job created successfully' : 'Real analysis initiated',
        completedAt: new Date().toISOString(),
        jobId: data?.job?.id
      };

      console.log('Real ESLint result created:', realResult);
      this.actions.addResult(realResult);

    } catch (error: any) {
      console.error('Real ESLint analysis error:', error);
      
      // Determine error type for better user feedback
      if (error.message.includes('timeout')) {
        throw new Error('Analysis request timed out. Edge function may be slow or unavailable.');
      } else if (error.message.includes('Edge function error')) {
        throw new Error(`Edge function failed: ${error.message}`);
      } else if (error.message.includes('unauthorized')) {
        throw new Error('Authentication failed. Please check your session.');
      } else {
        throw new Error(`Real analysis failed: ${error.message}`);
      }
    }
  }

  private async runMockESLintAnalysis(projectId: string, code?: string): Promise<void> {
    console.log('Running MOCK ESLint analysis for project:', projectId);
    
    // Simulate ESLint analysis with progress updates
    console.log('Running ESLint simulation');
    await this.simulateAnalysis('ESLint Analysis', [
      { progress: 25, message: 'Parsing code structure...' },
      { progress: 50, message: 'Checking linting rules...' },
      { progress: 75, message: 'Analyzing code quality...' },
      { progress: 100, message: 'ESLint analysis complete' }
    ]);

    // Mock ESLint results - completely hardcoded, no external calls
    const mockResult = {
      tool: 'ESLint (Mock)',
      issues: [
        { severity: 'error', message: 'Missing semicolon', line: 12 },
        { severity: 'warning', message: 'Unused variable', line: 8 },
        { severity: 'info', message: 'Consider using const', line: 5 }
      ],
      summary: '3 issues found (mock data)',
      completedAt: new Date().toISOString()
    };

    console.log('ESLint mock result created:', mockResult);
    this.actions.addResult(mockResult);
  }

  async runLighthouseAnalysis(projectId: string, url?: string): Promise<void> {
    console.log('Starting Lighthouse mock analysis for project:', projectId);
    
    if (this.isRunning) {
      console.log('Analysis already in progress, aborting');
      this.actions.addError('Analysis already in progress');
      return;
    }

    this.isRunning = true;
    this.actions.startAnalysis('Lighthouse');

    try {
      // Simulate Lighthouse analysis with progress updates
      console.log('Running Lighthouse simulation');
      await this.simulateAnalysis('Lighthouse Analysis', [
        { progress: 20, message: 'Loading page...' },
        { progress: 40, message: 'Analyzing performance...' },
        { progress: 60, message: 'Checking accessibility...' },
        { progress: 80, message: 'Evaluating SEO...' },
        { progress: 100, message: 'Lighthouse analysis complete' }
      ]);

      // Mock Lighthouse results - completely hardcoded, no external calls
      const mockResult = {
        tool: 'Lighthouse (Mock)',
        scores: {
          performance: 85,
          accessibility: 92,
          bestPractices: 88,
          seo: 90
        },
        summary: 'Good overall performance (mock data)',
        completedAt: new Date().toISOString()
      };

      console.log('Lighthouse mock result created:', mockResult);
      this.actions.addResult(mockResult);
    } catch (error: any) {
      console.error('Lighthouse mock analysis error:', error);
      this.actions.addError(`Lighthouse analysis failed: ${error.message}`);
    } finally {
      this.actions.stopAnalysis();
      this.isRunning = false;
      console.log('Lighthouse mock analysis completed');
    }
  }

  async runFullAnalysis(projectId: string, code?: string, url?: string, useRealAnalysis: boolean = false): Promise<void> {
    console.log('Starting Full analysis for project:', projectId, 'Real mode:', useRealAnalysis);
    
    if (this.isRunning) {
      console.log('Analysis already in progress, aborting');
      this.actions.addError('Analysis already in progress');
      return;
    }

    this.isRunning = true;
    this.actions.startAnalysis('Full Analysis');

    try {
      // Clear previous results
      this.actions.clearState();
      this.actions.startAnalysis('Full Analysis');

      // Run ESLint first
      console.log('Running ESLint phase of full analysis');
      this.actions.setProgress(10);
      await this.runESLintAnalysis(projectId, code, useRealAnalysis);

      // Run Lighthouse second (always mock for now)
      console.log('Running Lighthouse phase of full analysis');
      this.actions.setProgress(50);
      await this.runLighthouseAnalysis(projectId, url);

      this.actions.setProgress(100);
      console.log('Full analysis completed successfully');
    } catch (error: any) {
      console.error('Full analysis error:', error);
      this.actions.addError(`Full analysis failed: ${error.message}`);
    } finally {
      this.actions.stopAnalysis();
      this.isRunning = false;
    }
  }

  private async simulateAnalysis(
    phase: string, 
    steps: { progress: number; message: string }[]
  ): Promise<void> {
    console.log(`Starting simulation phase: ${phase}`);
    for (const step of steps) {
      console.log(`${phase}: ${step.message} (${step.progress}%)`);
      this.actions.setProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms per step
    }
    console.log(`Completed simulation phase: ${phase}`);
  }

  stopAnalysis(): void {
    console.log('Stopping analysis manually');
    this.isRunning = false;
    this.actions.stopAnalysis();
  }
}

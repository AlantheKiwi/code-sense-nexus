export interface LovableIssue {
  id: string;
  type: 'typescript' | 'missing-import' | 'incomplete-component' | 'responsive' | 'error-boundary' | 'loading-state';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  filePath: string;
  line?: number;
  suggestion: string;
  autoFixable: boolean;
}

export interface LovableHealthMetrics {
  overallScore: number;
  readinessScore: number;
  issuesCount: number;
  timeSavedMinutes: number;
  issuesPrevented: number;
  completionPercentage: number;
  deploymentBlockers: string[];
  missingFeatures: string[];
}

export interface FixResult {
  issueId: string;
  success: boolean;
  originalCode: string;
  fixedCode: string;
  error?: string;
  instructions?: LovableFixInstruction[];
}

export interface LovableFixInstruction {
  step: number;
  action: string;
  codeToAdd?: string;
  codeToReplace?: string;
  fileLocation: string;
  lineNumber?: number;
  lovablePrompt: string;
}

export interface LovablePromptSuggestion {
  category: 'enhancement' | 'feature' | 'quality' | 'deployment';
  priority: 'high' | 'medium' | 'low';
  prompt: string;
  reasoning: string;
  estimatedImpact: string;
}

import { LovableIssueDetector } from './LovableIssueDetector';
import { LovableMetricsCalculator } from './LovableMetricsCalculator';
import { LovableCodeFixer } from './LovableCodeFixer';
import { LovablePromptGenerator } from './LovablePromptGenerator';

export class LovableIntegration {
  private issues: LovableIssue[] = [];
  private appliedFixes: FixResult[] = [];
  private issueDetector: LovableIssueDetector;
  private metricsCalculator: LovableMetricsCalculator;
  private codeFixer: LovableCodeFixer;
  private promptGenerator: LovablePromptGenerator;

  constructor() {
    this.issueDetector = new LovableIssueDetector();
    this.metricsCalculator = new LovableMetricsCalculator();
    this.codeFixer = new LovableCodeFixer();
    this.promptGenerator = new LovablePromptGenerator();
  }

  async analyzeCodeForLovableIssues(codeContent: string, filePath: string): Promise<LovableIssue[]> {
    this.issues = await this.issueDetector.analyzeCodeForLovableIssues(codeContent, filePath);
    return this.issues;
  }

  generateHealthMetrics(): LovableHealthMetrics {
    return this.metricsCalculator.generateHealthMetrics(this.issues);
  }

  async applyAutoFixes(issueIds: string[]): Promise<FixResult[]> {
    const results = await this.codeFixer.applyAutoFixes(issueIds, this.issues);
    
    // Update issues list (remove successfully fixed issues)
    const successfullyFixedIds = results
      .filter(result => result.success)
      .map(result => result.issueId);
    
    this.issues = this.issues.filter(issue => !successfullyFixedIds.includes(issue.id));
    this.appliedFixes.push(...results);
    
    return results;
  }

  generatePromptSuggestions(codeContent: string): LovablePromptSuggestion[] {
    return this.promptGenerator.generatePromptSuggestions(codeContent, this.issues);
  }

  async generateFixes(issues: LovableIssue[]): Promise<{ originalCode: string; fixedCode: string; diff: string }[]> {
    console.log('Generating fixes for Lovable issues...');
    
    return issues.filter(issue => issue.autoFixable).map(issue => {
      let originalCode = '';
      let fixedCode = '';
      
      switch (issue.type) {
        case 'typescript':
          originalCode = 'const data = fetchData();';
          fixedCode = `interface DataType {
  id: string;
  name: string;
}

const data: DataType = fetchData();`;
          break;
          
        case 'error-boundary':
          originalCode = '<ComponentWithAPI />';
          fixedCode = `<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ComponentWithAPI />
</ErrorBoundary>`;
          break;
          
        case 'loading-state':
          originalCode = 'const { data } = useQuery(...)';
          fixedCode = `const { data, isLoading } = useQuery(...)

if (isLoading) return <div>Loading...</div>;`;
          break;
          
        case 'responsive':
          originalCode = '<div className="w-96">';
          fixedCode = '<div className="w-full max-w-96 md:w-96">';
          break;
          
        default:
          originalCode = 'No fix available';
          fixedCode = 'Manual review required';
      }

      const diff = this.codeFixer.generateDiff(originalCode, fixedCode);
      
      return { originalCode, fixedCode, diff };
    });
  }

  getIssues(): LovableIssue[] {
    return this.issues;
  }

  getAppliedFixes(): FixResult[] {
    return this.appliedFixes;
  }

  clearIssues(): void {
    this.issues = [];
  }

  clearAppliedFixes(): void {
    this.appliedFixes = [];
  }
}

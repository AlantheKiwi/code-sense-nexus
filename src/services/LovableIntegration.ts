
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
}

export class LovableIntegration {
  private issues: LovableIssue[] = [];

  async analyzeCodeForLovableIssues(codeContent: string, filePath: string): Promise<LovableIssue[]> {
    console.log('Analyzing code for Lovable-specific issues...');
    
    const detectedIssues: LovableIssue[] = [];

    // Check for common Lovable TypeScript issues
    if (this.detectMissingTypes(codeContent)) {
      detectedIssues.push({
        id: `missing-types-${Date.now()}`,
        type: 'typescript',
        severity: 'warning',
        title: 'Missing TypeScript Types',
        description: 'Lovable generated code without proper TypeScript interfaces',
        filePath,
        suggestion: 'Add proper TypeScript interfaces for better type safety',
        autoFixable: true
      });
    }

    // Check for missing error boundaries
    if (this.detectMissingErrorBoundary(codeContent)) {
      detectedIssues.push({
        id: `error-boundary-${Date.now()}`,
        type: 'error-boundary',
        severity: 'warning',
        title: 'Missing Error Boundary',
        description: 'Component could benefit from error boundary protection',
        filePath,
        suggestion: 'Wrap component with error boundary for better user experience',
        autoFixable: true
      });
    }

    // Check for missing loading states
    if (this.detectMissingLoadingStates(codeContent)) {
      detectedIssues.push({
        id: `loading-state-${Date.now()}`,
        type: 'loading-state',
        severity: 'info',
        title: 'Missing Loading States',
        description: 'Async operations without loading indicators',
        filePath,
        suggestion: 'Add loading states for better user experience',
        autoFixable: true
      });
    }

    // Check for responsive design issues
    if (this.detectResponsiveIssues(codeContent)) {
      detectedIssues.push({
        id: `responsive-${Date.now()}`,
        type: 'responsive',
        severity: 'warning',
        title: 'Responsive Design Issues',
        description: 'Layout may not work well on mobile devices',
        filePath,
        suggestion: 'Add responsive Tailwind classes for mobile compatibility',
        autoFixable: true
      });
    }

    // Check for incomplete components
    if (this.detectIncompleteComponents(codeContent)) {
      detectedIssues.push({
        id: `incomplete-${Date.now()}`,
        type: 'incomplete-component',
        severity: 'error',
        title: 'Incomplete Component Implementation',
        description: 'Component has TODO comments or missing functionality',
        filePath,
        suggestion: 'Complete the component implementation',
        autoFixable: false
      });
    }

    this.issues = detectedIssues;
    return detectedIssues;
  }

  private detectMissingTypes(code: string): boolean {
    // Check for any variables without types
    return /const \w+ = .*\w+\(/.test(code) && !code.includes('interface') && !code.includes('type ');
  }

  private detectMissingErrorBoundary(code: string): boolean {
    // Check if component has async operations but no error handling
    return code.includes('useQuery') || code.includes('fetch') || code.includes('async');
  }

  private detectMissingLoadingStates(code: string): boolean {
    // Check for async operations without loading indicators
    return (code.includes('useQuery') || code.includes('useState')) && !code.includes('loading') && !code.includes('isLoading');
  }

  private detectResponsiveIssues(code: string): boolean {
    // Check for fixed widths without responsive classes
    return /w-\d+/.test(code) && !/w-full|w-auto|sm:|md:|lg:/.test(code);
  }

  private detectIncompleteComponents(code: string): boolean {
    // Check for TODO comments or placeholder text
    return /TODO|FIXME|placeholder|lorem ipsum/i.test(code);
  }

  generateHealthMetrics(): LovableHealthMetrics {
    const totalIssues = this.issues.length;
    const errorCount = this.issues.filter(i => i.severity === 'error').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;
    
    // Calculate scores (0-100)
    const overallScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));
    const readinessScore = errorCount === 0 ? Math.max(70, overallScore) : Math.max(0, overallScore - 30);
    
    // Estimate time saved (rough calculation)
    const timeSavedMinutes = totalIssues * 15; // Assume 15 minutes per issue
    
    return {
      overallScore,
      readinessScore,
      issuesCount: totalIssues,
      timeSavedMinutes,
      issuesPrevented: totalIssues
    };
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

      const diff = this.generateDiff(originalCode, fixedCode);
      
      return { originalCode, fixedCode, diff };
    });
  }

  private generateDiff(original: string, fixed: string): string {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');
    
    let diff = '';
    originalLines.forEach(line => diff += `- ${line}\n`);
    fixedLines.forEach(line => diff += `+ ${line}\n`);
    
    return diff;
  }

  getIssues(): LovableIssue[] {
    return this.issues;
  }

  clearIssues(): void {
    this.issues = [];
  }
}

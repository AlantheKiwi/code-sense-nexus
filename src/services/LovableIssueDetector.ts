
import { LovableIssue } from './LovableIntegration';

export class LovableIssueDetector {
  detectMissingTypes(code: string): boolean {
    // Check for any variables without types
    return /const \w+ = .*\w+\(/.test(code) && !code.includes('interface') && !code.includes('type ');
  }

  detectMissingErrorBoundary(code: string): boolean {
    // Check if component has async operations but no error handling
    return code.includes('useQuery') || code.includes('fetch') || code.includes('async');
  }

  detectMissingLoadingStates(code: string): boolean {
    // Check for async operations without loading indicators
    return (code.includes('useQuery') || code.includes('useState')) && !code.includes('loading') && !code.includes('isLoading');
  }

  detectResponsiveIssues(code: string): boolean {
    // Check for fixed widths without responsive classes
    return /w-\d+/.test(code) && !/w-full|w-auto|sm:|md:|lg:/.test(code);
  }

  detectIncompleteComponents(code: string): boolean {
    // Check for TODO comments or placeholder text
    return /TODO|FIXME|placeholder|lorem ipsum/i.test(code);
  }

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

    return detectedIssues;
  }
}


import { LovableIssue, LovableHealthMetrics } from './LovableIntegration';

export class LovableMetricsCalculator {
  generateHealthMetrics(issues: LovableIssue[]): LovableHealthMetrics {
    const totalIssues = issues.length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    // Calculate scores (0-100)
    const overallScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));
    const readinessScore = errorCount === 0 ? Math.max(70, overallScore) : Math.max(0, overallScore - 30);
    
    // Calculate completion percentage based on various factors
    const hasErrorBoundaries = !issues.some(i => i.type === 'error-boundary');
    const hasLoadingStates = !issues.some(i => i.type === 'loading-state');
    const hasProperTypes = !issues.some(i => i.type === 'typescript');
    const isResponsive = !issues.some(i => i.type === 'responsive');
    const isComplete = !issues.some(i => i.type === 'incomplete-component');
    
    const completionFactors = [hasErrorBoundaries, hasLoadingStates, hasProperTypes, isResponsive, isComplete];
    const completionPercentage = (completionFactors.filter(Boolean).length / completionFactors.length) * 100;
    
    // Identify deployment blockers
    const deploymentBlockers: string[] = [];
    if (errorCount > 0) deploymentBlockers.push(`${errorCount} critical errors`);
    if (!hasErrorBoundaries) deploymentBlockers.push('Missing error handling');
    if (!isComplete) deploymentBlockers.push('Incomplete components');
    
    // Identify missing features
    const missingFeatures: string[] = [];
    if (!hasLoadingStates) missingFeatures.push('Loading indicators');
    if (!hasProperTypes) missingFeatures.push('TypeScript types');
    if (!isResponsive) missingFeatures.push('Mobile responsiveness');
    
    // Estimate time saved (rough calculation)
    const timeSavedMinutes = totalIssues * 15; // Assume 15 minutes per issue
    
    return {
      overallScore,
      readinessScore,
      issuesCount: totalIssues,
      timeSavedMinutes,
      issuesPrevented: totalIssues,
      completionPercentage,
      deploymentBlockers,
      missingFeatures
    };
  }
}

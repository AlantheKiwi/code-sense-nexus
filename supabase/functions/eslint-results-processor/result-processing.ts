
export function categorizeIssue(ruleId: string, message: string): string {
  if (!ruleId) return 'code_quality';
  
  const securityRules = ['no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url'];
  const bugRules = ['no-undef', 'no-unused-vars', 'no-unreachable', 'no-dupe-keys'];
  const styleRules = ['semi', 'quotes', 'indent', 'space-before-function-paren'];

  if (securityRules.some(rule => ruleId.includes(rule))) return 'security';
  if (bugRules.some(rule => ruleId.includes(rule))) return 'potential_bugs';
  if (styleRules.some(rule => ruleId.includes(rule))) return 'style_violations';
  
  return 'code_quality';
}

export function getSeverityFromLevel(level: number): string {
  switch (level) {
    case 2: return 'error';
    case 1: return 'warn';
    default: return 'info';
  }
}

export function isCriticalIssue(issue: any): boolean {
  const criticalRules = ['no-eval', 'no-implied-eval', 'no-undef', 'no-unreachable'];
  return criticalRules.includes(issue.ruleId) || 
         (issue.severity === 2 && issue.message.toLowerCase().includes('security'));
}

export function calculateQualityScore(issues: any[], severityCounts: any): number {
  const totalIssues = issues.length;
  if (totalIssues === 0) return 100;

  const errorWeight = 10;
  const warnWeight = 5;
  const infoWeight = 1;

  const weightedScore = (severityCounts.error * errorWeight) + 
                       (severityCounts.warn * warnWeight) + 
                       (severityCounts.info * infoWeight);

  return Math.max(0, 100 - (weightedScore / totalIssues * 10));
}

export function calculateAverageQualityScore(results: any[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, result) => acc + (result.quality_score || 0), 0);
  return sum / results.length;
}

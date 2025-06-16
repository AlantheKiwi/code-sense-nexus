
import { useMemo } from 'react';
import { ESLintResult, ESLintTrend, ESLintProjectSummary } from './useESLintResults';

export interface ESLintAnalytics {
  qualityTrend: 'improving' | 'declining' | 'stable';
  criticalIssuesChange: number;
  mostCommonIssues: Array<{
    rule: string;
    count: number;
    category: string;
  }>;
  fileQualityDistribution: Array<{
    range: string;
    count: number;
  }>;
  issuesByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    issues: number;
    qualityScore: number;
  }>;
}

export function useESLintAnalytics(
  results: ESLintResult[],
  trends: ESLintTrend[],
  summary: ESLintProjectSummary | null
): ESLintAnalytics {
  return useMemo(() => {
    // Calculate quality trend
    const qualityTrend = calculateQualityTrend(trends);
    
    // Calculate critical issues change
    const criticalIssuesChange = calculateCriticalIssuesChange(trends);
    
    // Find most common issues
    const mostCommonIssues = findMostCommonIssues(results);
    
    // Calculate file quality distribution
    const fileQualityDistribution = calculateFileQualityDistribution(results);
    
    // Calculate issues by category
    const issuesByCategory = calculateIssuesByCategory(summary);
    
    // Calculate weekly trends
    const weeklyTrends = calculateWeeklyTrends(trends);

    return {
      qualityTrend,
      criticalIssuesChange,
      mostCommonIssues,
      fileQualityDistribution,
      issuesByCategory,
      weeklyTrends,
    };
  }, [results, trends, summary]);
}

function calculateQualityTrend(trends: ESLintTrend[]): 'improving' | 'declining' | 'stable' {
  if (trends.length < 2) return 'stable';
  
  const sortedTrends = [...trends].sort((a, b) => 
    new Date(a.analysis_date).getTime() - new Date(b.analysis_date).getTime()
  );
  
  const recentTrends = sortedTrends.slice(-7); // Last 7 data points
  if (recentTrends.length < 2) return 'stable';
  
  const firstScore = recentTrends[0].quality_score || 0;
  const lastScore = recentTrends[recentTrends.length - 1].quality_score || 0;
  const difference = lastScore - firstScore;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

function calculateCriticalIssuesChange(trends: ESLintTrend[]): number {
  if (trends.length < 2) return 0;
  
  const sortedTrends = [...trends].sort((a, b) => 
    new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
  );
  
  const currentErrors = sortedTrends[0]?.severity_counts?.error || 0;
  const previousErrors = sortedTrends[1]?.severity_counts?.error || 0;
  
  return currentErrors - previousErrors;
}

function findMostCommonIssues(results: ESLintResult[]): Array<{
  rule: string;
  count: number;
  category: string;
}> {
  const issueMap = new Map<string, { count: number; category: string }>();
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const key = issue.ruleId || 'unknown';
      const existing = issueMap.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        issueMap.set(key, {
          count: 1,
          category: issue.category || 'code_quality',
        });
      }
    });
  });
  
  return Array.from(issueMap.entries())
    .map(([rule, data]) => ({ rule, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateFileQualityDistribution(results: ESLintResult[]): Array<{
  range: string;
  count: number;
}> {
  const ranges = [
    { range: '90-100', min: 90, max: 100 },
    { range: '70-89', min: 70, max: 89 },
    { range: '50-69', min: 50, max: 69 },
    { range: '30-49', min: 30, max: 49 },
    { range: '0-29', min: 0, max: 29 },
  ];
  
  return ranges.map(({ range, min, max }) => ({
    range,
    count: results.filter(result => {
      const score = result.quality_score || 0;
      return score >= min && score <= max;
    }).length,
  }));
}

function calculateIssuesByCategory(summary: ESLintProjectSummary | null): Array<{
  category: string;
  count: number;
  percentage: number;
}> {
  if (!summary || !summary.category_counts) {
    return [];
  }
  
  const total = Object.values(summary.category_counts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return [];
  
  return Object.entries(summary.category_counts).map(([category, count]) => ({
    category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: (count / total) * 100,
  }));
}

function calculateWeeklyTrends(trends: ESLintTrend[]): Array<{
  week: string;
  issues: number;
  qualityScore: number;
}> {
  // Group trends by week
  const weeklyData = new Map<string, { issues: number[]; scores: number[] }>();
  
  trends.forEach(trend => {
    const date = new Date(trend.analysis_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existing = weeklyData.get(weekKey);
    if (existing) {
      existing.issues.push(trend.total_issues);
      existing.scores.push(trend.quality_score || 0);
    } else {
      weeklyData.set(weekKey, {
        issues: [trend.total_issues],
        scores: [trend.quality_score || 0],
      });
    }
  });
  
  return Array.from(weeklyData.entries())
    .map(([week, data]) => ({
      week,
      issues: Math.round(data.issues.reduce((sum, val) => sum + val, 0) / data.issues.length),
      qualityScore: Math.round(data.scores.reduce((sum, val) => sum + val, 0) / data.scores.length),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Last 12 weeks
}

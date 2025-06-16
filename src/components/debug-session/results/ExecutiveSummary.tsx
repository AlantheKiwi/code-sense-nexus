
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { AnalysisResults } from './ResultsSummaryDashboard';

interface ExecutiveSummaryProps {
  results: AnalysisResults;
}

export const ExecutiveSummary = ({ results }: ExecutiveSummaryProps) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const criticalIssues = results.issues.filter(issue => issue.severity === 'critical').length;
  const highIssues = results.issues.filter(issue => issue.severity === 'high').length;
  const quickWins = results.issues.filter(issue => issue.quickWin).length;
  const technicalDebtIssues = results.issues.filter(issue => issue.technicalDebt).length;

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Health Score</span>
            <Badge variant={results.overallHealthScore >= 80 ? 'default' : 'secondary'}>
              {getHealthScoreLabel(results.overallHealthScore)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Health</span>
                <span className={`text-2xl font-bold ${getHealthScoreColor(results.overallHealthScore)}`}>
                  {results.overallHealthScore}%
                </span>
              </div>
              <Progress value={results.overallHealthScore} className="h-3" />
            </div>
            <div className="text-center">
              {results.overallHealthScore >= 80 ? (
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600 mx-auto" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
            <div className="text-sm text-muted-foreground">Critical Issues</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{highIssues}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{quickWins}</div>
            <div className="text-sm text-muted-foreground">Quick Wins</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{technicalDebtIssues}</div>
            <div className="text-sm text-muted-foreground">Tech Debt Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Code Quality</span>
                  <span className="text-sm font-semibold">{results.metrics.codeQualityScore}%</span>
                </div>
                <Progress value={results.metrics.codeQualityScore} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security</span>
                  <span className="text-sm font-semibold">{results.metrics.securityScore}%</span>
                </div>
                <Progress value={results.metrics.securityScore} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Performance</span>
                  <span className="text-sm font-semibold">{results.metrics.performanceScore}%</span>
                </div>
                <Progress value={results.metrics.performanceScore} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Accessibility</span>
                  <span className="text-sm font-semibold">{results.metrics.accessibilityScore}%</span>
                </div>
                <Progress value={results.metrics.accessibilityScore} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Analysis Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Tools Used:</strong> {results.toolsUsed.join(', ')}</p>
                  <p><strong>Total Issues:</strong> {results.issues.length}</p>
                  <p><strong>Technical Debt Index:</strong> {results.metrics.technicalDebtIndex}%</p>
                  {results.metrics.testCoverage && (
                    <p><strong>Test Coverage:</strong> {results.metrics.testCoverage}%</p>
                  )}
                  {results.metrics.bundleSize && (
                    <p><strong>Bundle Size:</strong> {results.metrics.bundleSize}KB</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalIssues > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Immediate Action Required</p>
                  <p className="text-sm text-red-700">
                    {criticalIssues} critical security/stability issues need immediate attention to prevent potential system vulnerabilities.
                  </p>
                </div>
              </div>
            )}

            {quickWins > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Quick Wins Available</p>
                  <p className="text-sm text-green-700">
                    {quickWins} easy fixes identified that can provide immediate impact with minimal effort.
                  </p>
                </div>
              </div>
            )}

            {results.metrics.technicalDebtIndex > 40 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Technical Debt Management</p>
                  <p className="text-sm text-yellow-700">
                    Technical debt index is at {results.metrics.technicalDebtIndex}%. Consider allocating time for refactoring to maintain development velocity.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

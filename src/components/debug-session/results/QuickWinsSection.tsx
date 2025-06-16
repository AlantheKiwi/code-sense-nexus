
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { Issue, Recommendation } from './ResultsSummaryDashboard';

interface QuickWinsSectionProps {
  issues: Issue[];
  recommendations: Recommendation[];
}

export const QuickWinsSection = ({ issues, recommendations }: QuickWinsSectionProps) => {
  const getRecommendationForIssue = (issueId: string) => {
    return recommendations.find(rec => rec.issueId === issueId);
  };

  const totalEffort = issues.reduce((sum, issue) => sum + issue.estimatedTimeHours, 0);
  const avgEffort = issues.length > 0 ? totalEffort / issues.length : 0;

  return (
    <div className="space-y-6">
      {/* Quick Wins Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{issues.length}</div>
            <div className="text-sm text-muted-foreground">Quick Win Opportunities</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{avgEffort.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Average Time per Fix</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">High</div>
            <div className="text-sm text-muted-foreground">Expected Impact</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Wins List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quick Win Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Quick Wins Available</h3>
              <p className="text-muted-foreground">
                All current issues require significant effort to resolve.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => {
                const recommendation = getRecommendationForIssue(issue.id);
                return (
                  <Card key={issue.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Quick Win
                            </Badge>
                            <Badge variant="outline">
                              {issue.estimatedTimeHours}h effort
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {issue.description}
                          </p>
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-blue-800 mb-1">
                              Business Impact:
                            </p>
                            <p className="text-sm text-blue-700">
                              {issue.businessImpact}
                            </p>
                          </div>
                          {recommendation && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Recommended Actions:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                {recommendation.actionSteps.map((step, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                              {recommendation.toolsNeeded.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium mb-1">Tools Needed:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {recommendation.toolsNeeded.map((tool, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm">
                            Start Fix
                          </Button>
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Wins Benefits */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Why Focus on Quick Wins?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Immediate Benefits</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Fast implementation with minimal risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Quick return on investment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Builds momentum for larger improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Immediate user experience improvements</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Strategic Impact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Demonstrates team productivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Frees up time for complex issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Improves overall project health score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Reduces technical debt accumulation</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

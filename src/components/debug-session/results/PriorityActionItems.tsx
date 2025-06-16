
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, User, DollarSign, CheckCircle } from 'lucide-react';
import type { Issue, Recommendation } from './ResultsSummaryDashboard';

interface PriorityActionItemsProps {
  issues: Issue[];
  recommendations: Recommendation[];
}

export const PriorityActionItems = ({ issues, recommendations }: PriorityActionItemsProps) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.severity === filter);

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const impactOrder = { high: 3, medium: 2, low: 1 };
    
    // First sort by severity, then by impact
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    
    return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
  });

  const getRecommendationForIssue = (issueId: string) => {
    return recommendations.find(rec => rec.issueId === issueId);
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Priority Action Items</span>
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
                <Button
                  key={level}
                  variant={filter === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(level as any)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Showing {sortedIssues.length} of {issues.length} issues
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>Business Impact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedIssues.map((issue) => {
                const recommendation = getRecommendationForIssue(issue.id);
                return (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{issue.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.description}
                        </div>
                        <div className="flex gap-2">
                          {issue.quickWin && (
                            <Badge variant="outline" className="text-xs">
                              Quick Win
                            </Badge>
                          )}
                          {issue.technicalDebt && (
                            <Badge variant="outline" className="text-xs">
                              Tech Debt
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getImpactColor(issue.impact)}`}>
                        {issue.impact}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {issue.estimatedTimeHours}h
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{issue.businessImpact}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                        {recommendation && (
                          <Button size="sm">
                            View Fix
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium">Estimated ROI</span>
            </div>
            <div className="text-2xl font-bold text-green-600">$12,500</div>
            <div className="text-sm text-muted-foreground">
              Based on performance improvements and risk reduction
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Total Effort</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {sortedIssues.reduce((sum, issue) => sum + issue.estimatedTimeHours, 0)}h
            </div>
            <div className="text-sm text-muted-foreground">
              Estimated development time for all fixes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Team Impact</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.ceil(sortedIssues.reduce((sum, issue) => sum + issue.estimatedTimeHours, 0) / 40)}
            </div>
            <div className="text-sm text-muted-foreground">
              Developer weeks to complete all items
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, Shield, Info, ExternalLink } from 'lucide-react';
import type { Issue } from '../IssuesRecommendationsDashboard';

interface IssueQuickCardsProps {
  issues: Issue[];
}

export const IssueQuickCards = ({ issues }: IssueQuickCardsProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
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
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'destructive';
      case 'performance': return 'secondary';
      case 'accessibility': return 'outline';
      case 'code_quality': return 'outline';
      default: return 'outline';
    }
  };

  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
          <p className="text-muted-foreground">Great! Your code is looking clean.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Issues ({issues.length})</h3>
      </div>
      
      {issues.map((issue) => (
        <Card key={issue.id} className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(issue.severity)}
                <CardTitle className="text-base">{issue.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                  {issue.severity.toUpperCase()}
                </Badge>
                <Badge variant={getTypeColor(issue.type)} className="text-xs">
                  {issue.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{issue.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Impact:</span>
                  <Badge variant={getImpactColor(issue.impact)} className="text-xs">
                    {issue.impact.toUpperCase()}
                  </Badge>
                </div>
                {issue.file_path && (
                  <div className="text-xs text-muted-foreground">
                    {issue.file_path}
                    {issue.line_number && `:${issue.line_number}`}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

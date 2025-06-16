
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Shield, Info } from 'lucide-react';
import type { Issue } from '../IssuesRecommendationsDashboard';

interface IssuesSeverityDashboardProps {
  issues: Issue[];
}

export const IssuesSeverityDashboard = ({ issues }: IssuesSeverityDashboardProps) => {
  const severityCounts = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {['critical', 'high', 'medium', 'low'].map((severity) => (
        <Card key={severity} className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              {getSeverityIcon(severity)}
            </div>
            <div className="text-2xl font-bold mb-1">
              {severityCounts[severity] || 0}
            </div>
            <Badge variant={getSeverityColor(severity)} className="text-xs">
              {severity.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

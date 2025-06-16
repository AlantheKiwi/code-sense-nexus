
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Shield } from 'lucide-react';

interface CriticalIssuesPreviewProps {
  issues: Array<{
    id: string;
    type: string;
    message: string;
    file_path?: string;
    severity: 'error' | 'warning' | 'info';
    rule_id?: string;
  }>;
}

export const CriticalIssuesPreview = ({ issues }: CriticalIssuesPreviewProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const criticalIssues = issues.filter(issue => issue.severity === 'error').slice(0, 5);
  const warningIssues = issues.filter(issue => issue.severity === 'warning').slice(0, 3);

  if (issues.length === 0) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="h-5 w-5" />
          Critical Issues Found
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalIssues.map((issue, index) => (
          <div key={`critical-${index}`} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {getSeverityIcon(issue.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getSeverityColor(issue.severity)}>
                  {issue.severity.toUpperCase()}
                </Badge>
                {issue.rule_id && (
                  <Badge variant="outline" className="text-xs">
                    {issue.rule_id}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {issue.message}
              </p>
              {issue.file_path && (
                <p className="text-xs text-muted-foreground mt-1">
                  {issue.file_path}
                </p>
              )}
            </div>
          </div>
        ))}

        {warningIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Recent Warnings ({warningIssues.length})
            </h4>
            {warningIssues.map((issue, index) => (
              <div key={`warning-${index}`} className="flex items-center gap-2 text-sm">
                {getSeverityIcon(issue.severity)}
                <span className="truncate">{issue.message}</span>
              </div>
            ))}
          </div>
        )}

        {issues.length > 8 && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            +{issues.length - 8} more issues found
          </p>
        )}
      </CardContent>
    </Card>
  );
};

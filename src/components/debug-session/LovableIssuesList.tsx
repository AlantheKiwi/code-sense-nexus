
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { LovableIssue } from '@/services/LovableIntegration';

interface LovableIssuesListProps {
  issues: LovableIssue[];
}

export const LovableIssuesList: React.FC<LovableIssuesListProps> = ({ issues }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-purple-700 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Lovable Code Issues ({issues.length})
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white p-3 rounded border border-purple-200">
            <div className="flex items-start gap-2">
              {getSeverityIcon(issue.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{issue.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {issue.type}
                  </Badge>
                  {issue.autoFixable && (
                    <Badge className="text-xs bg-green-100 text-green-800">
                      Auto-fixable
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                <p className="text-xs text-purple-600 mt-1">💡 {issue.suggestion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


import React from 'react';
import { RepoImporter } from '@/components/github/RepoImporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepositoryAudits } from '@/hooks/useRepositoryAudits';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function RepositoryAuditPage() {
  const { data: audits, isLoading } = useRepositoryAudits();

  const handleAuditComplete = (auditId: string) => {
    console.log('Audit completed:', auditId);
    // Refresh the audit list
    window.location.reload();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Repository Security Audit</h1>
        <p className="text-gray-600 mb-8">
          Comprehensive security, quality, and performance analysis for your GitHub repositories
        </p>

        <RepoImporter onAuditComplete={handleAuditComplete} />

        {audits && audits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Previous Audits</h2>
            <div className="grid gap-4">
              {audits.map((audit) => (
                <Card key={audit.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{audit.repository_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{audit.audit_type}</Badge>
                        <div className={`px-2 py-1 rounded text-white text-sm ${getScoreColor(audit.overall_score)}`}>
                          {audit.overall_score}/100
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{audit.repository_url}</span>
                      <span>{format(new Date(audit.created_at), 'PPp')}</span>
                    </div>
                    {audit.executive_summary && (
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Files Analyzed:</span> {audit.executive_summary.analyzedFiles}
                        </div>
                        <div>
                          <span className="font-medium">Critical Issues:</span> {audit.executive_summary.criticalIssues}
                        </div>
                        <div>
                          <span className="font-medium">Quality Score:</span> {Math.round(audit.executive_summary.averageQualityScore || 0)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading audit history...</div>
          </div>
        )}
      </div>
    </div>
  );
}

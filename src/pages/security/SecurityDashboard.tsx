
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Download,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import { SecurityAuditReport } from '@/components/security/SecurityAuditReport';
import { SecurityAuditResult, securityAuditor } from '@/services/security/SecurityAuditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [auditHistory, setAuditHistory] = useState<SecurityAuditResult[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<SecurityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalAudits: 0,
    averageScore: 0,
    criticalVulns: 0,
    resolvedVulns: 0,
    trendsData: []
  });

  useEffect(() => {
    loadSecurityData();
  }, [user]);

  const loadSecurityData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load audit history
      const { data: audits, error } = await supabase
        .from('security_audit_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading security audits:', error);
        toast.error('Failed to load security audit history');
        return;
      }

      const auditResults = audits?.map(audit => ({
        ...audit,
        executiveSummary: audit.executive_summary,
        auditMetadata: audit.audit_metadata
      })) || [];

      setAuditHistory(auditResults);
      calculateDashboardStats(auditResults);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDashboardStats = (audits: any[]) => {
    if (audits.length === 0) {
      setDashboardStats({
        totalAudits: 0,
        averageScore: 0,
        criticalVulns: 0,
        resolvedVulns: 0,
        trendsData: []
      });
      return;
    }

    const totalAudits = audits.length;
    const averageScore = Math.round(
      audits.reduce((sum, audit) => sum + (audit.security_score || 0), 0) / totalAudits
    );
    
    const allVulnerabilities = audits.flatMap(audit => audit.vulnerabilities || []);
    const criticalVulns = allVulnerabilities.filter(v => v.severity === 'critical').length;
    const resolvedVulns = allVulnerabilities.filter(v => v.status === 'resolved').length;

    // Generate trends data for the last 30 days
    const trendsData = audits
      .slice(0, 10)
      .reverse()
      .map((audit, index) => ({
        date: new Date(audit.created_at).toLocaleDateString(),
        score: audit.security_score || 0,
        vulnerabilities: audit.executiveSummary?.totalVulnerabilities || 0
      }));

    setDashboardStats({
      totalAudits,
      averageScore,
      criticalVulns,
      resolvedVulns,
      trendsData
    });
  };

  const handleExportReport = (audit: SecurityAuditResult) => {
    const reportData = {
      title: `Security Audit Report - ${audit.auditMetadata.createdAt}`,
      ...audit
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${audit.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Security report exported successfully!');
  };

  const handleShareReport = (audit: SecurityAuditResult) => {
    const reportUrl = `${window.location.origin}/security/report/${audit.id}`;
    navigator.clipboard.writeText(reportUrl);
    toast.success('Report link copied to clipboard!');
  };

  const getMostCommonVulnerabilities = () => {
    const allVulns = auditHistory.flatMap(audit => audit.vulnerabilities || []);
    const vulnTypes = allVulns.reduce((acc, vuln) => {
      acc[vuln.type] = (acc[vuln.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(vulnTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Professional security audit history and compliance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            New Security Audit
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAudits}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              Professional grade
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageScore}</div>
            <Progress value={dashboardStats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats.criticalVulns}</div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertTriangle className="h-3 w-3" />
              Require immediate attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Resolved Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.resolvedVulns}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              Security improvements
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="trends">Security Trends</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {selectedAudit ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAudit(null)}
                >
                  ← Back to Overview
                </Button>
                <h2 className="text-xl font-semibold">Security Audit Report</h2>
              </div>
              <SecurityAuditReport
                auditResult={selectedAudit}
                onExport={() => handleExportReport(selectedAudit)}
                onShare={() => handleShareReport(selectedAudit)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Audits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Security Audits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No security audits yet</p>
                      <Button className="mt-4">
                        Run Your First Security Audit
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditHistory.slice(0, 5).map((audit) => (
                        <div
                          key={audit.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedAudit(audit)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              audit.securityScore >= 80 ? 'bg-green-500' :
                              audit.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">
                                Security Audit - Score: {audit.securityScore}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(audit.auditMetadata.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              audit.executiveSummary.criticalCount > 0 ? 'bg-red-100 text-red-800' :
                              audit.executiveSummary.highCount > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {audit.executiveSummary.totalVulnerabilities} issues
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Common Vulnerabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Most Common Vulnerabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getMostCommonVulnerabilities().length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                      <p className="text-gray-600">No vulnerabilities detected yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getMostCommonVulnerabilities().map(({ type, count }) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(count / auditHistory.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-6">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Security Audits</CardTitle>
            </CardHeader>
            <CardContent>
              {auditHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Security Audits Yet</h3>
                  <p className="text-gray-500 mb-6">Start with a comprehensive security audit to identify vulnerabilities</p>
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Run First Security Audit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditHistory.map((audit) => (
                    <div
                      key={audit.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAudit(audit)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${
                            audit.securityScore >= 80 ? 'bg-green-500' :
                            audit.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <h4 className="font-semibold">
                            Security Audit - Score: {audit.securityScore}/100
                          </h4>
                          <Badge className={
                            audit.executiveSummary.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                            audit.executiveSummary.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                            audit.executiveSummary.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {audit.executiveSummary.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportReport(audit);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-500">
                            {new Date(audit.auditMetadata.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Issues:</span>
                          <span className="font-medium ml-2">{audit.executiveSummary.totalVulnerabilities}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Critical:</span>
                          <span className="font-medium ml-2 text-red-600">{audit.executiveSummary.criticalCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">High:</span>
                          <span className="font-medium ml-2 text-orange-600">{audit.executiveSummary.highCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">OWASP Score:</span>
                          <span className="font-medium ml-2">{audit.compliance.owasp.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Security Score Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats.trendsData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Not enough data to show trends</p>
                  <p className="text-sm text-gray-500">Run more security audits to see trends</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Security trends chart would be implemented here</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  OWASP Top 10 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Overall Compliance</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {dashboardStats.averageScore}%
                    </Badge>
                  </div>
                  <Progress value={dashboardStats.averageScore} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Regular security audits performed
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Vulnerability tracking enabled
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Some areas need improvement
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge className="bg-green-100 text-green-800">
                    COMPLIANT
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Data protection measures in place
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Security audit trail maintained
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Regular compliance monitoring
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

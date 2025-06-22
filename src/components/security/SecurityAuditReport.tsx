
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Share,
  Eye,
  Code,
  Clock,
  TrendingUp,
  FileText,
  Users
} from 'lucide-react';
import { SecurityAuditResult, SecurityVulnerability } from '@/services/security/SecurityAuditor';
import { toast } from 'sonner';

interface SecurityAuditReportProps {
  auditResult: SecurityAuditResult;
  onExport?: () => void;
  onShare?: () => void;
}

export const SecurityAuditReport: React.FC<SecurityAuditReportProps> = ({
  auditResult,
  onExport,
  onShare
}) => {
  const [selectedVulnerability, setSelectedVulnerability] = useState<SecurityVulnerability | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      informational: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <XCircle className="h-4 w-4 text-red-600" />;
    if (severity === 'high') return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    if (severity === 'medium') return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-blue-600" />;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    };
    return colors[riskLevel] || colors.medium;
  };

  const copyVulnerability = (vulnerability: SecurityVulnerability) => {
    const vulnText = `
**Security Vulnerability Report**

**${vulnerability.title}**
Severity: ${vulnerability.severity.toUpperCase()}
Type: ${vulnerability.type}
CVSS Score: ${vulnerability.cvssScore}/10

**Description:**
${vulnerability.description}

**Location:**
File: ${vulnerability.codeLocation.file}
Lines: ${vulnerability.codeLocation.startLine}-${vulnerability.codeLocation.endLine}

**Impact:**
${vulnerability.impact}

**Remediation:**
${vulnerability.remediation.summary}

**Steps to Fix:**
${vulnerability.remediation.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Before (Vulnerable Code):**
\`\`\`
${vulnerability.remediation.beforeCode}
\`\`\`

**After (Secure Code):**
\`\`\`
${vulnerability.remediation.afterCode}
\`\`\`

**Estimated Fix Time:** ${vulnerability.remediation.estimatedTime}

**References:**
${vulnerability.references.join('\n')}
    `.trim();

    navigator.clipboard.writeText(vulnText);
    toast.success('Vulnerability details copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Shield className="h-6 w-6" />
              Professional Security Audit Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {auditResult.auditType.toUpperCase()}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Security Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                auditResult.securityScore >= 80 ? 'text-green-600' :
                auditResult.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {auditResult.securityScore}
              </div>
              <div className="text-sm text-gray-600">Security Score</div>
              <Progress 
                value={auditResult.securityScore} 
                className="mt-2"
              />
            </div>

            {/* Risk Level */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                getRiskLevelColor(auditResult.executiveSummary.riskLevel)
              }`}>
                {getSeverityIcon(auditResult.executiveSummary.riskLevel)}
                {auditResult.executiveSummary.riskLevel.toUpperCase()} RISK
              </div>
              <div className="text-sm text-gray-600 mt-2">Overall Risk Level</div>
            </div>

            {/* Vulnerabilities Count */}
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {auditResult.executiveSummary.totalVulnerabilities}
              </div>
              <div className="text-sm text-gray-600">Vulnerabilities Found</div>
              <div className="flex justify-center gap-2 mt-2 text-xs">
                <span className="text-red-600">{auditResult.executiveSummary.criticalCount} Critical</span>
                <span className="text-orange-600">{auditResult.executiveSummary.highCount} High</span>
                <span className="text-yellow-600">{auditResult.executiveSummary.mediumCount} Medium</span>
              </div>
            </div>
          </div>

          {/* Business Impact */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Business Impact Assessment
            </h4>
            <p className="text-gray-700">{auditResult.executiveSummary.businessImpact}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vulnerability Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { severity: 'critical', count: auditResult.executiveSummary.criticalCount, label: 'Critical' },
                  { severity: 'high', count: auditResult.executiveSummary.highCount, label: 'High' },
                  { severity: 'medium', count: auditResult.executiveSummary.mediumCount, label: 'Medium' },
                  { severity: 'low', count: auditResult.executiveSummary.lowCount, label: 'Low' },
                  { severity: 'informational', count: auditResult.executiveSummary.informationalCount, label: 'Info' }
                ].map(({ severity, count, label }) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(severity)}
                      <span className="font-medium">{label}</span>
                    </div>
                    <Badge className={getSeverityColor(severity)}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Audit Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analysis Providers</span>
                  <div className="flex gap-1">
                    {auditResult.auditMetadata.llmProviders.map(provider => (
                      <Badge key={provider} variant="outline" className="text-xs">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence Level</span>
                  <Badge variant="secondary">{auditResult.auditMetadata.confidence}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Audit Date</span>
                  <span className="text-sm">{new Date(auditResult.auditMetadata.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Audited By</span>
                  <span className="text-sm">{auditResult.auditMetadata.auditedBy}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          {auditResult.vulnerabilities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">No Vulnerabilities Found</h3>
                <p className="text-gray-600">Your code passed the security audit with flying colors!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {auditResult.vulnerabilities.map((vulnerability) => (
                <Card key={vulnerability.id} className="border-l-4 border-l-red-400">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(vulnerability.severity)}
                        <div>
                          <CardTitle className="text-lg">{vulnerability.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSeverityColor(vulnerability.severity)}>
                              {vulnerability.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{vulnerability.type.replace('_', ' ').toUpperCase()}</Badge>
                            <span className="text-sm text-gray-500">CVSS: {vulnerability.cvssScore}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVulnerability(vulnerability)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyVulnerability(vulnerability)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-gray-700 text-sm">{vulnerability.description}</p>
                        
                        <h4 className="font-semibold mt-4 mb-2">Impact</h4>
                        <p className="text-gray-700 text-sm">{vulnerability.impact}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Location</h4>
                        <div className="bg-gray-100 p-2 rounded text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Code className="h-3 w-3" />
                            {vulnerability.codeLocation.file}
                          </div>
                          <div className="text-gray-600">
                            Lines {vulnerability.codeLocation.startLine}-{vulnerability.codeLocation.endLine}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Fix Time
                        </h4>
                        <p className="text-sm text-gray-700">{vulnerability.remediation.estimatedTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OWASP Compliance */}
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
                    <span>Compliance Score</span>
                    <Badge className={
                      auditResult.compliance.owasp.score >= 80 ? 'bg-green-100 text-green-800' :
                      auditResult.compliance.owasp.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {auditResult.compliance.owasp.score}%
                    </Badge>
                  </div>
                  <Progress value={auditResult.compliance.owasp.score} />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Covered Areas</h4>
                  {auditResult.compliance.owasp.covered.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {area}
                    </div>
                  ))}
                  
                  {auditResult.compliance.owasp.missing.length > 0 && (
                    <>
                      <h4 className="font-semibold text-orange-600 mt-4">Needs Attention</h4>
                      {auditResult.compliance.owasp.missing.map((area, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          {area}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  GDPR Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge className={
                    auditResult.compliance.gdpr.dataHandling === 'compliant' ? 'bg-green-100 text-green-800' :
                    auditResult.compliance.gdpr.dataHandling === 'issues' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {auditResult.compliance.gdpr.dataHandling.toUpperCase()}
                  </Badge>
                </div>
                
                {auditResult.compliance.gdpr.issues.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-600">Data Protection Issues</h4>
                    {auditResult.compliance.gdpr.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    No data protection issues found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Immediate Actions */}
            {auditResult.recommendations.immediate.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Immediate Actions Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {auditResult.recommendations.immediate.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Short-term Actions */}
            {auditResult.recommendations.shortTerm.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Short-term Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {auditResult.recommendations.shortTerm.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Long-term Strategy */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Long-term Security Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {auditResult.recommendations.longTerm.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Vulnerability Detail Modal */}
      {selectedVulnerability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getSeverityIcon(selectedVulnerability.severity)}
                  {selectedVulnerability.title}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVulnerability(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vulnerability Details */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedVulnerability.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Business Impact</h4>
                <p className="text-gray-700">{selectedVulnerability.impact}</p>
              </div>

              {/* Code Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Before (Vulnerable)</h4>
                  <pre className="bg-red-50 p-3 rounded border text-sm overflow-x-auto">
                    <code>{selectedVulnerability.remediation.beforeCode}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">After (Secure)</h4>
                  <pre className="bg-green-50 p-3 rounded border text-sm overflow-x-auto">
                    <code>{selectedVulnerability.remediation.afterCode}</code>
                  </pre>
                </div>
              </div>

              {/* Remediation Steps */}
              <div>
                <h4 className="font-semibold mb-2">Remediation Steps</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {selectedVulnerability.remediation.steps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>

              {/* References */}
              <div>
                <h4 className="font-semibold mb-2">References</h4>
                <ul className="space-y-1">
                  {selectedVulnerability.references.map((ref, index) => (
                    <li key={index}>
                      <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

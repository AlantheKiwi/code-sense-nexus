
export interface SecurityVulnerability {
  id: string;
  type: 'prompt_injection' | 'xss' | 'data_leakage' | 'auth_bypass' | 'input_validation' | 'api_security' | 'client_side';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status?: 'open' | 'resolved' | 'dismissed';
  title: string;
  description: string;
  codeLocation: {
    file: string;
    startLine: number;
    endLine: number;
    snippet: string;
  };
  impact: string;
  remediation: {
    summary: string;
    steps: string[];
    beforeCode: string;
    afterCode: string;
    estimatedTime: string;
  };
  references: string[];
  cvssScore?: number;
}

export interface SecurityAuditResult {
  id: string;
  projectId: string;
  auditType: 'comprehensive' | 'quick' | 'compliance';
  securityScore: number;
  executiveSummary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    informationalCount: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    businessImpact: string;
  };
  vulnerabilities: SecurityVulnerability[];
  compliance: {
    owasp: {
      score: number;
      covered: string[];
      missing: string[];
    };
    gdpr: {
      dataHandling: 'compliant' | 'issues' | 'non_compliant';
      issues: string[];
    };
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  auditMetadata: {
    llmProviders: string[];
    analysisTime: number;
    confidence: number;
    createdAt: string;
    auditedBy: string;
  };
}

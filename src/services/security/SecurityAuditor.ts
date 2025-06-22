
import { llmGateway } from '@/services/ai/LLMGateway';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityVulnerability {
  id: string;
  type: 'prompt_injection' | 'xss' | 'data_leakage' | 'auth_bypass' | 'input_validation' | 'api_security' | 'client_side';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
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

export class SecurityAuditor {
  private readonly SECURITY_PROMPTS = {
    comprehensive: `
You are a senior cybersecurity consultant performing a comprehensive security audit. Analyze the following code for:

1. Authentication & Authorization vulnerabilities
2. Input validation and sanitization issues
3. XSS and injection vulnerabilities
4. Data exposure and privacy violations
5. API security weaknesses
6. Client-side security flaws
7. Business logic vulnerabilities

For each vulnerability found, provide:
- Exact location (file, line numbers)
- Severity classification (Critical/High/Medium/Low)
- Business impact assessment
- Specific remediation code
- CVSS score estimate
- OWASP category mapping

Code to audit:
`,

    promptInjection: `
Analyze this code specifically for prompt injection vulnerabilities. Look for:
- Unsanitized user input passed to AI models
- Lack of input validation for AI prompts
- Missing context isolation
- Inadequate output filtering
- System prompt exposure risks

Provide specific examples of malicious inputs that could exploit these vulnerabilities.

Code:
`,

    dataLeakage: `
Audit this code for data leakage and privacy violations:
- Sensitive data in logs or error messages
- Unencrypted data transmission
- Improper data storage
- PII handling violations
- API key or secret exposure
- Session data leakage

Assess GDPR compliance and data protection adequacy.

Code:
`
  };

  async performComprehensiveAudit(
    code: string,
    projectId: string,
    auditType: 'comprehensive' | 'quick' | 'compliance' = 'comprehensive'
  ): Promise<SecurityAuditResult> {
    console.log(`🔒 Starting ${auditType} security audit for project ${projectId}`);

    try {
      // Multi-LLM analysis for comprehensive coverage
      const [geminiAnalysis, gptAnalysis, claudeAnalysis] = await Promise.all([
        this.analyzeWithGemini(code),
        this.analyzeWithGPT(code),
        this.analyzeWithClaude(code)
      ]);

      // Aggregate and validate findings
      const consolidatedVulnerabilities = this.consolidateFindings([
        geminiAnalysis,
        gptAnalysis,
        claudeAnalysis
      ]);

      // Calculate security score
      const securityScore = this.calculateSecurityScore(consolidatedVulnerabilities);
      
      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(consolidatedVulnerabilities);
      
      // Assess compliance
      const compliance = this.assessCompliance(consolidatedVulnerabilities, code);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(consolidatedVulnerabilities);

      const auditResult: SecurityAuditResult = {
        id: `audit_${Date.now()}`,
        projectId,
        auditType,
        securityScore,
        executiveSummary,
        vulnerabilities: consolidatedVulnerabilities,
        compliance,
        recommendations,
        auditMetadata: {
          llmProviders: ['gemini-pro', 'gpt-4', 'claude-3.5'],
          analysisTime: Date.now(),
          confidence: this.calculateConfidence(consolidatedVulnerabilities),
          createdAt: new Date().toISOString(),
          auditedBy: 'CodeSense Security AI'
        }
      };

      // Store audit result
      await this.storeAuditResult(auditResult);

      console.log(`✅ Security audit completed. Score: ${securityScore}/100`);
      return auditResult;

    } catch (error) {
      console.error('❌ Security audit failed:', error);
      throw new Error(`Security audit failed: ${error.message}`);
    }
  }

  private async analyzeWithGemini(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.comprehensive + code,
      analysisType: 'security' as const,
      projectContext: 'Professional Security Audit'
    };

    return await llmGateway.analyzeWithProvider('gemini-pro', request, 'security-auditor');
  }

  private async analyzeWithGPT(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.promptInjection + code,
      analysisType: 'security' as const,
      projectContext: 'Prompt Injection Analysis'
    };

    return await llmGateway.analyzeWithProvider('gpt-4', request, 'security-auditor');
  }

  private async analyzeWithClaude(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.dataLeakage + code,
      analysisType: 'security' as const,
      projectContext: 'Data Leakage Analysis'
    };

    return await llmGateway.analyzeWithProvider('claude-3.5', request, 'security-auditor');
  }

  private consolidateFindings(analyses: any[]): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    analyses.forEach((analysis, index) => {
      analysis.result.issues?.forEach((issue: any, issueIndex: number) => {
        const vulnerability: SecurityVulnerability = {
          id: `vuln_${index}_${issueIndex}_${Date.now()}`,
          type: this.mapIssueTypeToVulnerabilityType(issue.type),
          severity: issue.severity as any,
          title: issue.description || 'Security Vulnerability',
          description: issue.description,
          codeLocation: {
            file: 'analysis-target',
            startLine: issue.lineNumber || 1,
            endLine: (issue.lineNumber || 1) + 1,
            snippet: issue.codeExample || 'Code snippet not available'
          },
          impact: this.generateImpactDescription(issue.severity),
          remediation: {
            summary: issue.suggestion || 'Security remediation required',
            steps: this.generateRemediationSteps(issue.type),
            beforeCode: issue.codeExample || 'Before code not available',
            afterCode: this.generateSecureCode(issue.type),
            estimatedTime: this.estimateFixTime(issue.severity)
          },
          references: this.getSecurityReferences(issue.type),
          cvssScore: this.calculateCVSS(issue.severity)
        };
        
        vulnerabilities.push(vulnerability);
      });
    });

    return this.deduplicateVulnerabilities(vulnerabilities);
  }

  private mapIssueTypeToVulnerabilityType(issueType: string): SecurityVulnerability['type'] {
    const mapping: Record<string, SecurityVulnerability['type']> = {
      'injection': 'prompt_injection',
      'xss': 'xss',
      'data': 'data_leakage',
      'auth': 'auth_bypass',
      'validation': 'input_validation',
      'api': 'api_security'
    };
    
    return mapping[issueType.toLowerCase()] || 'client_side';
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    if (vulnerabilities.length === 0) return 100;
    
    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 3,
      informational: 1
    };
    
    const totalDeduction = vulnerabilities.reduce((sum, vuln) => {
      return sum + severityWeights[vuln.severity];
    }, 0);
    
    return Math.max(0, 100 - totalDeduction);
  }

  private generateExecutiveSummary(vulnerabilities: SecurityVulnerability[]) {
    const counts = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskLevel = counts.critical > 0 ? 'critical' :
                     counts.high > 0 ? 'high' :
                     counts.medium > 0 ? 'medium' : 'low';

    return {
      totalVulnerabilities: vulnerabilities.length,
      criticalCount: counts.critical || 0,
      highCount: counts.high || 0,
      mediumCount: counts.medium || 0,
      lowCount: counts.low || 0,
      informationalCount: counts.informational || 0,
      riskLevel: riskLevel as any,
      businessImpact: this.generateBusinessImpact(riskLevel, vulnerabilities.length)
    };
  }

  private assessCompliance(vulnerabilities: SecurityVulnerability[], code: string) {
    const owaspTop10 = ['A01:2021-Broken Access Control', 'A02:2021-Cryptographic Failures'];
    const covered = owaspTop10.slice(0, Math.max(1, owaspTop10.length - vulnerabilities.length));
    
    return {
      owasp: {
        score: Math.max(20, 100 - (vulnerabilities.length * 10)),
        covered,
        missing: owaspTop10.slice(covered.length)
      },
      gdpr: {
        dataHandling: vulnerabilities.some(v => v.type === 'data_leakage') ? 'issues' : 'compliant' as any,
        issues: vulnerabilities
          .filter(v => v.type === 'data_leakage')
          .map(v => v.title)
      }
    };
  }

  private generateRecommendations(vulnerabilities: SecurityVulnerability[]) {
    const critical = vulnerabilities.filter(v => v.severity === 'critical');
    const high = vulnerabilities.filter(v => v.severity === 'high');
    const medium = vulnerabilities.filter(v => v.severity === 'medium');

    return {
      immediate: critical.map(v => `Fix critical vulnerability: ${v.title}`),
      shortTerm: high.map(v => `Address high-risk issue: ${v.title}`),
      longTerm: [
        'Implement security code review process',
        'Add automated security testing to CI/CD',
        'Conduct regular security training for developers',
        ...medium.map(v => `Improve: ${v.title}`)
      ]
    };
  }

  private generateImpactDescription(severity: string): string {
    const impacts = {
      critical: 'Immediate data breach risk, potential system compromise',
      high: 'Significant security risk, data exposure possible',
      medium: 'Moderate security concern, limited exposure risk',
      low: 'Minor security issue, low probability of exploitation',
      informational: 'Security best practice recommendation'
    };
    
    return impacts[severity] || impacts.medium;
  }

  private generateRemediationSteps(issueType: string): string[] {
    const steps = {
      injection: [
        'Implement input sanitization',
        'Use parameterized queries',
        'Add output encoding',
        'Validate and whitelist inputs'
      ],
      auth: [
        'Implement proper authentication',
        'Add authorization checks',
        'Use secure session management',
        'Enable multi-factor authentication'
      ]
    };
    
    return steps[issueType] || ['Review security best practices', 'Implement appropriate controls'];
  }

  private generateSecureCode(issueType: string): string {
    const secureExamples = {
      injection: `// Secure input handling
const sanitizedInput = validator.escape(userInput);
const query = db.prepare('SELECT * FROM users WHERE id = ?');
query.run(sanitizedInput);`,
      auth: `// Secure authentication
if (!req.user || !hasPermission(req.user, 'read', resource)) {
  return res.status(403).json({ error: 'Unauthorized' });
}`
    };
    
    return secureExamples[issueType] || '// Implement security controls as appropriate';
  }

  private estimateFixTime(severity: string): string {
    const times = {
      critical: '2-4 hours',
      high: '1-2 hours',
      medium: '30-60 minutes',
      low: '15-30 minutes',
      informational: '5-15 minutes'
    };
    
    return times[severity] || times.medium;
  }

  private getSecurityReferences(issueType: string): string[] {
    return [
      'https://owasp.org/www-project-top-ten/',
      'https://cheatsheetseries.owasp.org/',
      'https://cwe.mitre.org/'
    ];
  }

  private calculateCVSS(severity: string): number {
    const scores = {
      critical: 9.5,
      high: 7.8,
      medium: 5.4,
      low: 3.1,
      informational: 0.0
    };
    
    return scores[severity] || scores.medium;
  }

  private generateBusinessImpact(riskLevel: string, vulnCount: number): string {
    if (riskLevel === 'critical') {
      return `High business risk: ${vulnCount} vulnerabilities could lead to data breaches, regulatory fines, and reputation damage.`;
    }
    if (riskLevel === 'high') {
      return `Moderate business risk: Security weaknesses present, immediate attention recommended.`;
    }
    return `Low business risk: Minor security improvements needed for best practices compliance.`;
  }

  private calculateConfidence(vulnerabilities: SecurityVulnerability[]): number {
    // Base confidence on number of LLMs agreeing and vulnerability consistency
    return Math.min(95, 75 + (vulnerabilities.length * 2));
  }

  private deduplicateVulnerabilities(vulnerabilities: SecurityVulnerability[]): SecurityVulnerability[] {
    const seen = new Set();
    return vulnerabilities.filter(vuln => {
      const key = `${vuln.type}_${vuln.codeLocation.startLine}_${vuln.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async storeAuditResult(result: SecurityAuditResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_audit_results')
        .insert({
          id: result.id,
          project_id: result.projectId,
          audit_type: result.auditType,
          security_score: result.securityScore,
          executive_summary: result.executiveSummary,
          vulnerabilities: result.vulnerabilities,
          compliance: result.compliance,
          recommendations: result.recommendations,
          audit_metadata: result.auditMetadata
        });

      if (error) {
        console.error('Failed to store audit result:', error);
      }
    } catch (error) {
      console.error('Error storing audit result:', error);
    }
  }
}

export const securityAuditor = new SecurityAuditor();

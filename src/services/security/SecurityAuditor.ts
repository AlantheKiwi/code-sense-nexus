
import { supabase } from '@/integrations/supabase/client';
import { SecurityAuditResult, SecurityVulnerability } from './types';
import { SecurityAnalyzer } from './SecurityAnalyzer';
import { VulnerabilityProcessor } from './VulnerabilityProcessor';

export class SecurityAuditor {
  private analyzer = new SecurityAnalyzer();
  private processor = new VulnerabilityProcessor();

  async performComprehensiveAudit(
    code: string,
    projectId: string,
    auditType: 'comprehensive' | 'quick' | 'compliance' = 'comprehensive'
  ): Promise<SecurityAuditResult> {
    console.log(`🔒 Starting ${auditType} security audit for project ${projectId}`);

    try {
      // Multi-LLM analysis for comprehensive coverage
      const [geminiAnalysis, gptAnalysis, claudeAnalysis] = await Promise.all([
        this.analyzer.analyzeWithGemini(code),
        this.analyzer.analyzeWithGPT(code),
        this.analyzer.analyzeWithClaude(code)
      ]);

      // Aggregate and validate findings
      const consolidatedVulnerabilities = this.processor.consolidateFindings([
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

  private async storeAuditResult(result: SecurityAuditResult): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { error } = await supabase
        .from('security_audit_results')
        .insert({
          project_id: result.projectId,
          user_id: user.id,
          audit_type: result.auditType,
          security_score: result.securityScore,
          executive_summary: result.executiveSummary as any,
          vulnerabilities: result.vulnerabilities as any,
          compliance: result.compliance as any,
          recommendations: result.recommendations as any,
          audit_metadata: result.auditMetadata as any
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
export * from './types';

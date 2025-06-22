
import { llmGateway } from '@/services/ai/LLMGateway';
import { SecurityVulnerability } from './types';

export class SecurityAnalyzer {
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

  async analyzeWithGemini(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.comprehensive + code,
      analysisType: 'security' as const,
      projectContext: 'Professional Security Audit'
    };

    return await llmGateway.analyzeWithProvider('gemini-pro', request, 'security-auditor');
  }

  async analyzeWithGPT(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.promptInjection + code,
      analysisType: 'security' as const,
      projectContext: 'Prompt Injection Analysis'
    };

    return await llmGateway.analyzeWithProvider('gpt-4', request, 'security-auditor');
  }

  async analyzeWithClaude(code: string) {
    const request = {
      code: this.SECURITY_PROMPTS.dataLeakage + code,
      analysisType: 'security' as const,
      projectContext: 'Data Leakage Analysis'
    };

    return await llmGateway.analyzeWithProvider('claude-3.5', request, 'security-auditor');
  }
}

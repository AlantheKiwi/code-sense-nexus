
export class PromptGenerator {
  getPromptForAnalysisType(analysisType: string, code: string, projectContext?: string): string {
    const baseContext = projectContext ? `Project Context: ${projectContext}\n\n` : '';
    
    const prompts = {
      code_quality: `${baseContext}Analyze the following code for quality issues, maintainability, and best practices. Provide specific suggestions for improvement:

Code:
\`\`\`
${code}
\`\`\`

Please provide a JSON response with:
- summary: Brief overview of code quality
- issues: Array of specific issues with type, severity, description, line numbers, and suggestions
- recommendations: Array of improvement recommendations
- score: Quality score from 0-100`,

      architecture: `${baseContext}Analyze the architectural patterns and design decisions in this code. Focus on scalability, maintainability, and design patterns:

Code:
\`\`\`
${code}
\`\`\`

Please provide architectural analysis with suggestions for improvement, scalability considerations, and design pattern recommendations.`,

      security: `${baseContext}PROFESSIONAL SECURITY AUDIT - Perform a comprehensive security analysis of this code as a cybersecurity consultant would.

🔍 ANALYZE FOR:

1. **OWASP Top 10 Vulnerabilities:**
   - A01: Broken Access Control
   - A02: Cryptographic Failures
   - A03: Injection (SQL, NoSQL, Command, LDAP)
   - A04: Insecure Design
   - A05: Security Misconfiguration
   - A06: Vulnerable Components
   - A07: Authentication Failures
   - A08: Software/Data Integrity Failures
   - A09: Security Logging/Monitoring Failures
   - A10: Server-Side Request Forgery

2. **Specific Security Issues:**
   - Input validation and sanitization
   - Authentication bypass vulnerabilities
   - Authorization flaws and privilege escalation
   - XSS (Stored, Reflected, DOM-based)
   - CSRF protection
   - Session management issues
   - API security weaknesses
   - Data exposure and privacy violations
   - Insecure cryptographic practices
   - Business logic vulnerabilities

3. **AI/LLM Specific Vulnerabilities:**
   - Prompt injection attacks
   - Model data poisoning risks
   - Training data exposure
   - Output filtering bypasses
   - Context window manipulation
   - AI model fingerprinting

Code to audit:
\`\`\`
${code}
\`\`\`

📋 REQUIRED OUTPUT FORMAT:
For each vulnerability found, provide:
- **Exact location** (file, line numbers, code snippet)
- **Vulnerability type** (map to OWASP category)
- **Severity** (Critical/High/Medium/Low/Informational)
- **Business impact** assessment
- **Proof of concept** exploit (if applicable)
- **Specific remediation** with before/after code examples
- **CVSS v3.1 score** estimate
- **Compliance impact** (SOC2, PCI-DSS, GDPR relevance)

🎯 FOCUS AREAS:
- Authentication & authorization mechanisms
- Input validation and output encoding
- Session management security
- API endpoint security
- Data handling and privacy
- Error handling and information disclosure
- Cryptographic implementations
- Dependencies and third-party risks

Provide executive summary with risk level and business impact assessment.`,

      performance: `${baseContext}Analyze this code for performance bottlenecks and optimization opportunities:

Code:
\`\`\`
${code}
\`\`\`

Focus on algorithmic complexity, memory usage, and runtime optimizations.`,

      lovable_prompt: `${baseContext}Generate an optimized Lovable prompt for improving this code. Lovable is an AI-powered web development platform that works best with specific, actionable prompts:

Code:
\`\`\`
${code}
\`\`\`

Create a prompt that would help a developer improve this code using Lovable's capabilities. Focus on specific improvements, UI/UX enhancements, and modern React patterns.`
    };

    return prompts[analysisType] || prompts.code_quality;
  }
}

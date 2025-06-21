
import { AutoFixActions } from '@/contexts/AutoFixContext';

export interface CodeFix {
  id: string;
  type: 'eslint' | 'lighthouse' | 'typescript';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  filePath: string;
  line?: number;
  column?: number;
  ruleId?: string;
  originalCode: string;
  fixedCode: string;
  diff: string;
  isAutoFixable: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface FixResult {
  fixId: string;
  success: boolean;
  error?: string;
  appliedCode?: string;
}

export class CodeFixEngine {
  private actions: AutoFixActions;
  private fixes: CodeFix[] = [];

  constructor(actions: AutoFixActions) {
    this.actions = actions;
    console.log('CodeFixEngine initialized');
  }

  async generateFixes(analysisResults: any[]): Promise<CodeFix[]> {
    console.log('Generating fixes from analysis results:', analysisResults);
    
    const allFixes: CodeFix[] = [];
    
    for (const result of analysisResults) {
      if (result.tool?.includes('ESLint')) {
        const eslintFixes = await this.generateESLintFixes(result);
        allFixes.push(...eslintFixes);
      } else if (result.tool?.includes('Lighthouse')) {
        const lighthouseFixes = await this.generateLighthouseFixes(result);
        allFixes.push(...lighthouseFixes);
      }
    }

    this.fixes = allFixes;
    console.log(`Generated ${allFixes.length} potential fixes`);
    return allFixes;
  }

  private async generateESLintFixes(result: any): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];
    
    if (!result.issues || !Array.isArray(result.issues)) {
      return fixes;
    }

    for (let i = 0; i < result.issues.length; i++) {
      const issue = result.issues[i];
      const fix = this.createESLintFix(issue, i, result.tool || 'ESLint');
      
      if (fix) {
        fixes.push(fix);
      }
    }

    return fixes;
  }

  private createESLintFix(issue: any, index: number, toolName: string): CodeFix | null {
    const fixId = `eslint-${index}-${Date.now()}`;
    
    // Common ESLint rules that we can auto-fix
    const autoFixableRules = {
      'missing-semicolon': {
        pattern: /Missing semicolon/i,
        fix: (code: string, line: number) => this.addSemicolon(code, line)
      },
      'unused-variable': {
        pattern: /Unused variable/i,
        fix: (code: string, line: number) => this.removeUnusedVariable(code, line)
      },
      'prefer-const': {
        pattern: /Consider using const/i,
        fix: (code: string, line: number) => this.convertToConst(code, line)
      },
      'no-console': {
        pattern: /Unexpected console statement/i,
        fix: (code: string, line: number) => this.removeConsoleLog(code, line)
      },
      'quotes': {
        pattern: /Strings must use singlequote|doublequote/i,
        fix: (code: string, line: number) => this.fixQuotes(code, line)
      }
    };

    // Determine if this issue is auto-fixable
    let fixInfo = null;
    let isAutoFixable = false;
    
    for (const [ruleName, ruleInfo] of Object.entries(autoFixableRules)) {
      if (ruleInfo.pattern.test(issue.message)) {
        fixInfo = ruleInfo;
        isAutoFixable = true;
        break;
      }
    }

    // Generate mock code for demonstration
    const originalCode = this.generateMockOriginalCode(issue);
    const fixedCode = isAutoFixable && fixInfo 
      ? fixInfo.fix(originalCode, issue.line || 1)
      : originalCode;

    const diff = this.generateDiff(originalCode, fixedCode);

    return {
      id: fixId,
      type: 'eslint',
      severity: issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info',
      title: `Fix ${issue.message}`,
      description: `${toolName} found: ${issue.message}`,
      filePath: `Line ${issue.line || 'unknown'}`,
      line: issue.line,
      column: issue.column,
      ruleId: issue.ruleId || 'unknown',
      originalCode,
      fixedCode,
      diff,
      isAutoFixable,
      estimatedImpact: issue.severity === 'error' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low'
    };
  }

  private async generateLighthouseFixes(result: any): Promise<CodeFix[]> {
    const fixes: CodeFix[] = [];
    
    if (!result.scores) {
      return fixes;
    }

    // Generate fixes based on Lighthouse scores
    const scores = result.scores;
    
    if (scores.performance < 80) {
      fixes.push(this.createPerformanceFix(scores.performance));
    }
    
    if (scores.accessibility < 90) {
      fixes.push(this.createAccessibilityFix(scores.accessibility));
    }
    
    if (scores.bestPractices < 85) {
      fixes.push(this.createBestPracticesFix(scores.bestPractices));
    }
    
    if (scores.seo < 90) {
      fixes.push(this.createSEOFix(scores.seo));
    }

    return fixes;
  }

  private createPerformanceFix(score: number): CodeFix {
    const originalCode = `// Current performance optimizations
const images = document.querySelectorAll('img');
images.forEach(img => {
  // No lazy loading
});`;

    const fixedCode = `// Improved performance optimizations
const images = document.querySelectorAll('img');
images.forEach(img => {
  img.loading = 'lazy';
  img.decoding = 'async';
});`;

    return {
      id: `perf-${Date.now()}`,
      type: 'lighthouse',
      severity: score < 60 ? 'error' : 'warning',
      title: 'Optimize Image Loading',
      description: `Performance score is ${score}/100. Add lazy loading to improve performance.`,
      filePath: 'Performance Optimization',
      originalCode,
      fixedCode,
      diff: this.generateDiff(originalCode, fixedCode),
      isAutoFixable: true,
      estimatedImpact: 'high'
    };
  }

  private createAccessibilityFix(score: number): CodeFix {
    const originalCode = `<img src="image.jpg">
<button>Click me</button>`;

    const fixedCode = `<img src="image.jpg" alt="Descriptive image text">
<button aria-label="Submit form">Click me</button>`;

    return {
      id: `a11y-${Date.now()}`,
      type: 'lighthouse',
      severity: 'warning',
      title: 'Add Accessibility Attributes',
      description: `Accessibility score is ${score}/100. Add alt text and ARIA labels.`,
      filePath: 'Accessibility Improvements',
      originalCode,
      fixedCode,
      diff: this.generateDiff(originalCode, fixedCode),
      isAutoFixable: true,
      estimatedImpact: 'medium'
    };
  }

  private createBestPracticesFix(score: number): CodeFix {
    const originalCode = `console.log('Debug info');
// HTTP links in production`;

    const fixedCode = `// console.log('Debug info'); // Removed for production
// HTTPS links enforced`;

    return {
      id: `bp-${Date.now()}`,
      type: 'lighthouse',
      severity: 'info',
      title: 'Remove Debug Code',
      description: `Best Practices score is ${score}/100. Remove console logs and use HTTPS.`,
      filePath: 'Best Practices',
      originalCode,
      fixedCode,
      diff: this.generateDiff(originalCode, fixedCode),
      isAutoFixable: true,
      estimatedImpact: 'low'
    };
  }

  private createSEOFix(score: number): CodeFix {
    const originalCode = `<head>
  <title>Page</title>
</head>`;

    const fixedCode = `<head>
  <title>Descriptive Page Title - Your Site</title>
  <meta name="description" content="Clear description of page content">
</head>`;

    return {
      id: `seo-${Date.now()}`,
      type: 'lighthouse',
      severity: 'warning',
      title: 'Improve Meta Tags',
      description: `SEO score is ${score}/100. Add descriptive title and meta description.`,
      filePath: 'SEO Improvements',
      originalCode,
      fixedCode,
      diff: this.generateDiff(originalCode, fixedCode),
      isAutoFixable: true,
      estimatedImpact: 'medium'
    };
  }

  // Helper methods for specific fixes
  private addSemicolon(code: string, line: number): string {
    const lines = code.split('\n');
    if (lines[line - 1] && !lines[line - 1].trim().endsWith(';')) {
      lines[line - 1] = lines[line - 1].trimEnd() + ';';
    }
    return lines.join('\n');
  }

  private removeUnusedVariable(code: string, line: number): string {
    const lines = code.split('\n');
    if (lines[line - 1]) {
      lines[line - 1] = '// ' + lines[line - 1]; // Comment out unused variable
    }
    return lines.join('\n');
  }

  private convertToConst(code: string, line: number): string {
    const lines = code.split('\n');
    if (lines[line - 1]) {
      lines[line - 1] = lines[line - 1].replace(/\blet\b/, 'const');
    }
    return lines.join('\n');
  }

  private removeConsoleLog(code: string, line: number): string {
    const lines = code.split('\n');
    if (lines[line - 1] && lines[line - 1].includes('console.log')) {
      lines[line - 1] = '// ' + lines[line - 1]; // Comment out console.log
    }
    return lines.join('\n');
  }

  private fixQuotes(code: string, line: number): string {
    const lines = code.split('\n');
    if (lines[line - 1]) {
      // Convert double quotes to single quotes
      lines[line - 1] = lines[line - 1].replace(/"/g, "'");
    }
    return lines.join('\n');
  }

  private generateMockOriginalCode(issue: any): string {
    // Generate realistic code examples based on the issue
    if (issue.message.includes('semicolon')) {
      return `const message = "Hello, " + name\nconsole.log(message);`;
    } else if (issue.message.includes('unused')) {
      return `const unusedVar = "I'm not used anywhere";\nconst message = "Hello World";`;
    } else if (issue.message.includes('const')) {
      return `let message = "Hello World";\nconsole.log(message);`;
    } else if (issue.message.includes('console')) {
      return `function debugFunction() {\n  console.log('Debug info');\n  return true;\n}`;
    } else {
      return `// Issue: ${issue.message}\nconst example = "code here";`;
    }
  }

  private generateDiff(original: string, fixed: string): string {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');
    
    let diff = '';
    const maxLines = Math.max(originalLines.length, fixedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const fixedLine = fixedLines[i] || '';
      
      if (originalLine !== fixedLine) {
        if (originalLine) {
          diff += `- ${originalLine}\n`;
        }
        if (fixedLine) {
          diff += `+ ${fixedLine}\n`;
        }
      } else if (originalLine) {
        diff += `  ${originalLine}\n`;
      }
    }
    
    return diff;
  }

  async applyFixes(selectedFixIds: string[]): Promise<FixResult[]> {
    console.log('Applying fixes:', selectedFixIds);
    
    const results: FixResult[] = [];
    const selectedFixes = this.fixes.filter(fix => selectedFixIds.includes(fix.id));
    
    for (const fix of selectedFixes) {
      try {
        // In a real implementation, this would apply changes to actual files
        // For now, we'll simulate the fix application
        await this.simulateFixApplication(fix);
        
        results.push({
          fixId: fix.id,
          success: true,
          appliedCode: fix.fixedCode
        });
        
        console.log(`Successfully applied fix: ${fix.title}`);
      } catch (error: any) {
        console.error(`Failed to apply fix ${fix.title}:`, error);
        results.push({
          fixId: fix.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  private async simulateFixApplication(fix: CodeFix): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated fix application failure');
    }
    
    console.log(`Applied fix: ${fix.title}`);
  }

  getFixes(): CodeFix[] {
    return this.fixes;
  }

  clearFixes(): void {
    this.fixes = [];
  }
}

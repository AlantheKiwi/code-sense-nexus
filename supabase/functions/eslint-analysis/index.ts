
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Linter } from 'npm:eslint@^9.0.0';
import * as babelParser from 'npm:@babel/parser@^7.24.7';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Secure analysis function booting up');

const linter = new Linter();

// Simplified ESLint configuration that works with v9
const eslintConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'eqeqeq': 'warn',
    'no-var': 'warn',
  },
};

const securityCheck = (_ast: any) => {
    // Placeholder for security rule checking
    // In the future, we can traverse the AST to find potential security vulnerabilities
    const issues: any[] = [];
    return issues;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, config } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: '`code` parameter is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing code with Babel...');
    let ast;
    try {
        ast = babelParser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            errorRecovery: true, // Try to parse even with errors
        });
    } catch (e: any) {
        // Babel parser throws on syntax errors. We can catch and return them.
        console.log('Babel parsing error:', e.message);
        return new Response(JSON.stringify({ 
            error: 'SyntaxError',
            analysis: {
                issues: [{
                    fatal: true,
                    ruleId: 'babel-parser',
                    severity: 'error',
                    message: e.message,
                    line: e.loc?.line ?? 0,
                    column: e.loc?.column ?? 0,
                }],
                securityIssues: []
            }
        }), {
            status: 200, // Still a valid analysis request
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log('Linting code snippet...');
    
    let messages;
    try {
      // Try using verifyAndFix instead of verify for better compatibility
      const result = linter.verifyAndFix(code, eslintConfig, {
        filename: 'analysis.js',
      });
      messages = result.messages;
      console.log(`ESLint analysis completed successfully with ${messages.length} issues found.`);
    } catch (configError: any) {
      console.log('ESLint config error:', configError.message);
      
      // If ESLint still fails, let's do a basic manual analysis
      console.log('Falling back to basic manual analysis...');
      messages = performBasicAnalysis(code);
    }

    console.log(`Found ${messages.length} linting issues.`);

    const securityIssues = securityCheck(ast);
    console.log(`Found ${securityIssues.length} security issues.`);

    return new Response(JSON.stringify({ 
        analysis: {
            issues: messages,
            securityIssues,
        }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Error in secure analysis function:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Basic manual analysis as fallback
function performBasicAnalysis(code: string) {
  const issues: any[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for missing semicolons
    if (trimmedLine.match(/^(const|let|var|return)\s+.*[^;}]$/) && 
        !trimmedLine.includes('//') && 
        !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith(',')) {
      issues.push({
        ruleId: 'semi',
        severity: 'error',
        message: 'Missing semicolon.',
        line: lineNum,
        column: line.length,
      });
    }
    
    // Check for unused variables (basic detection)
    const varMatch = trimmedLine.match(/^(const|let|var)\s+(\w+)/);
    if (varMatch) {
      const varName = varMatch[2];
      const restOfCode = lines.slice(index + 1).join('\n');
      if (!restOfCode.includes(varName) && !varName.startsWith('_')) {
        issues.push({
          ruleId: 'no-unused-vars',
          severity: 'warn',
          message: `'${varName}' is assigned a value but never used.`,
          line: lineNum,
          column: line.indexOf(varName) + 1,
        });
      }
    }
    
    // Check for console.log
    if (trimmedLine.includes('console.log')) {
      issues.push({
        ruleId: 'no-console',
        severity: 'warn',
        message: 'Unexpected console statement.',
        line: lineNum,
        column: line.indexOf('console.log') + 1,
      });
    }
    
    // Check for == instead of ===
    if (trimmedLine.includes('==') && !trimmedLine.includes('===') && !trimmedLine.includes('!==')) {
      issues.push({
        ruleId: 'eqeqeq',
        severity: 'warn',
        message: 'Expected \'===\' and instead saw \'==\'.',
        line: lineNum,
        column: line.indexOf('==') + 1,
      });
    }
  });
  
  return issues;
}

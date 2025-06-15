
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Linter } from 'npm:eslint@^9.0.0';
import * as babelParser from 'npm:@babel/parser@^7.24.7';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Secure analysis function booting up');

const linter = new Linter();

const defaultConfig = {
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'semi': ['error', 'always'],
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      // Common browser globals
      window: 'readonly',
      document: 'readonly',
      console: 'readonly',
      // Common Node.js globals for modules
      require: 'readonly',
      module: 'readonly',
      exports: 'readonly',
      // ES6
      Promise: 'readonly',
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
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
    
    const finalConfig = config || defaultConfig;

    console.log('Parsing code with Babel...');
    let ast;
    try {
        ast = babelParser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            errorRecovery: true, // Try to parse even with errors
        });
    } catch (e) {
        // Babel parser throws on syntax errors. We can catch and return them.
        console.log('Babel parsing error:', e.message);
        return new Response(JSON.stringify({ 
            error: 'SyntaxError',
            analysis: {
                issues: [{
                    fatal: true,
                    ruleId: 'babel-parser',
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
    const messages = linter.verify(code, finalConfig, {
      filename: 'file.tsx'
    });
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
  } catch (e) {
    console.error('Error in secure analysis function:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

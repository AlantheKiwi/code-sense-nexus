
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as babelParser from 'npm:@babel/parser@^7.24.7';
import { corsHeaders } from '../_shared/cors.ts';
import { performAnalysis, securityCheck } from './analysis-core.ts';

console.log('Secure analysis function booting up');

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
        errorRecovery: true,
      });
    } catch (e: any) {
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Running ESLint analysis...');
    const messages = performAnalysis(code);
    const securityIssues = securityCheck(ast);

    console.log(`ESLint analysis completed with ${messages.length} issues found.`);
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

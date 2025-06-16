
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
      
      // Enhanced syntax error handling with user-friendly explanations
      const syntaxError = {
        fatal: true,
        ruleId: 'syntax-error',
        severity: 'error',
        message: e.message,
        line: e.loc?.line ?? 0,
        column: e.loc?.column ?? 0,
        userFriendlyExplanation: generateUserFriendlyExplanation(e.message, e.loc),
        fixSuggestions: generateFixSuggestions(e.message, code, e.loc),
        codeContext: getCodeContext(code, e.loc?.line ?? 0),
      };

      return new Response(JSON.stringify({ 
        error: 'SyntaxError',
        analysis: {
          issues: [syntaxError],
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

function generateUserFriendlyExplanation(errorMessage: string, loc: any): string {
  const line = loc?.line || 0;
  const column = loc?.column || 0;
  
  if (errorMessage.includes('Unexpected token')) {
    if (errorMessage.includes('(')) {
      return `There's an issue on line ${line}. It looks like you have an unexpected opening parenthesis '(' or you're missing a closing parenthesis ')' somewhere before this line.`;
    }
    if (errorMessage.includes(')')) {
      return `There's an issue on line ${line}. You have an unexpected closing parenthesis ')' - this usually means you have an extra ')' or you're missing an opening parenthesis '(' somewhere.`;
    }
    if (errorMessage.includes('{')) {
      return `There's an issue on line ${line}. You have an unexpected opening curly brace '{' or you might be missing a closing brace '}' somewhere before this line.`;
    }
    if (errorMessage.includes('}')) {
      return `There's an issue on line ${line}. You have an unexpected closing curly brace '}' - this usually means you have an extra '}' or you're missing an opening brace '{' somewhere.`;
    }
    if (errorMessage.includes('[')) {
      return `There's an issue on line ${line}. You have an unexpected opening square bracket '[' or you might be missing a closing bracket ']' somewhere before this line.`;
    }
    if (errorMessage.includes(']')) {
      return `There's an issue on line ${line}. You have an unexpected closing square bracket ']' - this usually means you have an extra ']' or you're missing an opening bracket '[' somewhere.`;
    }
    if (errorMessage.includes(';')) {
      return `There's an issue on line ${line}. You have an unexpected semicolon ';' - check if you're missing something before it or if it's in the wrong place.`;
    }
  }
  
  if (errorMessage.includes('Unterminated string')) {
    return `There's an issue on line ${line}. You have an unterminated string - this means you opened a quote (") or (') but never closed it. Make sure every opening quote has a matching closing quote.`;
  }
  
  if (errorMessage.includes('Invalid left-hand side')) {
    return `There's an issue on line ${line}. You're trying to assign a value to something that can't be assigned to. Check that you're using = correctly and that the left side of the = is a variable name.`;
  }
  
  return `There's a syntax error on line ${line}, column ${column}. ${errorMessage} - Please check your code structure, brackets, quotes, and punctuation around this area.`;
}

function generateFixSuggestions(errorMessage: string, code: string, loc: any): string[] {
  const suggestions: string[] = [];
  const line = loc?.line || 0;
  
  if (errorMessage.includes('Unexpected token')) {
    suggestions.push('Check for missing or extra brackets: ( ) { } [ ]');
    suggestions.push('Make sure all opening brackets have matching closing brackets');
    suggestions.push('Count your parentheses - every ( should have a matching )');
  }
  
  if (errorMessage.includes('Unterminated string')) {
    suggestions.push('Add a closing quote (") at the end of your string');
    suggestions.push('Check that you haven\'t accidentally broken a string across multiple lines');
    suggestions.push('Make sure you\'re using matching quote types (" with " or \' with \')');
  }
  
  if (errorMessage.includes('semicolon')) {
    suggestions.push('Add a semicolon (;) at the end of the previous line');
    suggestions.push('Check if you\'re missing a comma (,) in a list or object');
  }
  
  // Always add general suggestions
  suggestions.push(`Look carefully at line ${line} and the lines just before it`);
  suggestions.push('Use a code editor with syntax highlighting to spot issues easier');
  
  return suggestions;
}

function getCodeContext(code: string, errorLine: number): { before: string; current: string; after: string } {
  const lines = code.split('\n');
  const lineIndex = errorLine - 1; // Convert to 0-based index
  
  return {
    before: lines[lineIndex - 1] || '',
    current: lines[lineIndex] || '',
    after: lines[lineIndex + 1] || '',
  };
}

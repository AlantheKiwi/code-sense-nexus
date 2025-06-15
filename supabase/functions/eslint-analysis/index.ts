
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Linter } from 'npm:eslint@^9.0.0';
import { corsHeaders } from '../_shared/cors.ts';

console.log('ESLint analysis function booting up');

const linter = new Linter();

// A simple default configuration for demonstration
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

    console.log('Linting code snippet...');
    const messages = linter.verify(code, finalConfig, {
      filename: 'file.tsx' // Faking a filename for parsers that need it
    });
    console.log(`Found ${messages.length} issues.`);

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in ESLint analysis function:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { Linter } from 'npm:eslint@^9.0.0';

const linter = new Linter();

// ESLint v9 flat config
const eslintConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      window: true,
      document: true,
      console: true,
      require: true,
      module: true,
      exports: true,
      process: true,
      Buffer: true,
      __dirname: true,
      __filename: true,
      global: true,
      React: true,
      JSX: true,
      Promise: true,
      Set: true,
      Map: true,
      WeakMap: true,
      WeakSet: true,
      Symbol: true,
      Proxy: true,
      Reflect: true,
      JSON: true,
      parseInt: true,
      parseFloat: true,
      isNaN: true,
      isFinite: true,
      decodeURI: true,
      decodeURIComponent: true,
      encodeURI: true,
      encodeURIComponent: true,
      escape: true,
      unescape: true,
      Object: true,
      Function: true,
      Boolean: true,
      Error: true,
      EvalError: true,
      InternalError: true,
      RangeError: true,
      ReferenceError: true,
      StopIteration: true,
      SyntaxError: true,
      TypeError: true,
      URIError: true,
      Number: true,
      Math: true,
      Date: true,
      String: true,
      RegExp: true,
      Array: true,
      Float32Array: true,
      Float64Array: true,
      Int16Array: true,
      Int32Array: true,
      Int8Array: true,
      Uint16Array: true,
      Uint32Array: true,
      Uint8Array: true,
      Uint8ClampedArray: true,
      ArrayBuffer: true,
      DataView: true,
      setTimeout: true,
      clearTimeout: true,
      setInterval: true,
      clearInterval: true
    },
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

export const performAnalysis = (code: string) => {
  try {
    const messages = linter.verify(code, eslintConfig, {
      filename: 'analysis.js',
    });
    return messages;
  } catch (eslintError: any) {
    console.log('ESLint error, falling back to manual analysis:', eslintError.message);
    return performBasicAnalysis(code);
  }
};

const performBasicAnalysis = (code: string) => {
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

    // Check for var usage
    if (trimmedLine.startsWith('var ')) {
      issues.push({
        ruleId: 'no-var',
        severity: 'warn',
        message: 'Unexpected var, use let or const instead.',
        line: lineNum,
        column: 1,
      });
    }

    // Check for variables that should be const
    const letMatch = trimmedLine.match(/^let\s+(\w+)\s*=\s*(.+);?\s*$/);
    if (letMatch) {
      const varName = letMatch[1];
      const restOfCode = lines.slice(index + 1).join('\n');
      // Simple heuristic: if the variable is not reassigned, suggest const
      if (!restOfCode.includes(`${varName} =`) && !restOfCode.includes(`${varName}++`) && !restOfCode.includes(`${varName}--`)) {
        issues.push({
          ruleId: 'prefer-const',
          severity: 'warn',
          message: `'${varName}' is never reassigned. Use 'const' instead.`,
          line: lineNum,
          column: 1,
        });
      }
    }
  });
  
  return issues;
};

export const securityCheck = (ast: any) => {
  const issues: any[] = [];
  
  // Enhanced security rule checking
  // This is a placeholder for more sophisticated AST-based security analysis
  // In the future, we can traverse the AST to find potential security vulnerabilities
  
  return issues;
};

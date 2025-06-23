
interface FixResult {
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

interface TypeScriptError {
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export class TypeScriptFixer {
  private commonLovablePatterns = [
    // Missing React import
    {
      pattern: /^(?!.*import.*React).*(<[A-Z]|JSX\.Element)/m,
      fix: (code: string) => `import React from 'react';\n${code}`,
      description: 'Added missing React import'
    },
    
    // Missing interface for props
    {
      pattern: /function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/g,
      fix: (code: string) => {
        return code.replace(/function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/g, (match, funcName, props) => {
          const propNames = props.split(',').map((p: string) => p.trim().split(':')[0].trim());
          const interfaceName = `${funcName}Props`;
          const interfaceDef = `interface ${interfaceName} {\n  ${propNames.map((p: string) => `${p}: any;`).join('\n  ')}\n}\n\n`;
          return `${interfaceDef}function ${funcName}({ ${props} }: ${interfaceName})`;
        });
      },
      description: 'Generated prop interfaces for components'
    },

    // Missing type annotations for variables
    {
      pattern: /const\s+(\w+)\s*=\s*useState\(\)/g,
      fix: (code: string) => code.replace(/const\s+(\w+)\s*=\s*useState\(\)/g, 'const [$1, set${$1.charAt(0).toUpperCase() + $1.slice(1)}] = useState<any>()'),
      description: 'Added type annotations to useState hooks'
    },

    // Fix arrow function component props
    {
      pattern: /const\s+(\w+)\s*=\s*\(\s*{\s*([^}]+)\s*}\s*\)\s*=>/g,
      fix: (code: string) => {
        return code.replace(/const\s+(\w+)\s*=\s*\(\s*{\s*([^}]+)\s*}\s*\)\s*=>/g, (match, funcName, props) => {
          const propNames = props.split(',').map((p: string) => p.trim().split(':')[0].trim());
          const interfaceName = `${funcName}Props`;
          const interfaceDef = `interface ${interfaceName} {\n  ${propNames.map((p: string) => `${p}: any;`).join('\n  ')}\n}\n\n`;
          return `${interfaceDef}const ${funcName} = ({ ${props} }: ${interfaceName}) =>`;
        });
      },
      description: 'Generated interfaces for arrow function components'
    },

    // Fix missing return types for functions
    {
      pattern: /function\s+(\w+)\s*\([^)]*\)\s*{/g,
      fix: (code: string) => code.replace(/function\s+(\w+)\s*\([^)]*\)\s*{/g, '$&: any'),
      description: 'Added return type annotations to functions'
    },

    // Fix implicit any parameters
    {
      pattern: /\(\s*(\w+)\s*\)\s*=>/g,
      fix: (code: string) => code.replace(/\(\s*(\w+)\s*\)\s*=>/g, '($1: any) =>'),
      description: 'Added type annotations to function parameters'
    },

    // Fix missing key props in map functions
    {
      pattern: /\.map\s*\(\s*\([^)]*\)\s*=>\s*<(\w+)/g,
      fix: (code: string) => code.replace(/\.map\s*\(\s*\(([^)]*)\)\s*=>\s*<(\w+)([^>]*)/g, '.map(($1, index) => <$2 key={index}$3'),
      description: 'Added missing key props to mapped elements'
    },

    // Fix Supabase client type issues
    {
      pattern: /from\s+['"]@\/integrations\/supabase\/client['"]/g,
      fix: (code: string) => {
        if (!code.includes('import { Database }')) {
          return code.replace(
            /from\s+['"]@\/integrations\/supabase\/client['"]/g,
            `from '@/integrations/supabase/client';\nimport { Database } from '@/integrations/supabase/types'`
          );
        }
        return code;
      },
      description: 'Added Supabase Database types import'
    }
  ];

  async fixTypeScriptErrors(code: string): Promise<FixResult> {
    let fixedCode = code;
    let errorsFixed = 0;
    const descriptions: string[] = [];

    // Apply each pattern fix
    for (const pattern of this.commonLovablePatterns) {
      const beforeFix = fixedCode;
      fixedCode = pattern.fix(fixedCode);
      
      if (beforeFix !== fixedCode) {
        errorsFixed++;
        descriptions.push(pattern.description);
      }
    }

    // Additional Lovable-specific fixes
    fixedCode = this.fixImportStatements(fixedCode);
    if (fixedCode !== code) {
      errorsFixed++;
      descriptions.push('Fixed import statement issues');
    }

    fixedCode = this.addMissingExports(fixedCode);
    if (fixedCode !== code && !descriptions.includes('Added missing default export')) {
      errorsFixed++;
      descriptions.push('Added missing default export');
    }

    return {
      originalCode: code,
      fixedCode,
      errorsFixed,
      description: descriptions
    };
  }

  private fixImportStatements(code: string): string {
    // Fix relative imports that might be missing file extensions
    let fixed = code.replace(
      /import\s+.*\s+from\s+['"](\.[^'"]*)['"]/g,
      (match, path) => {
        if (!path.endsWith('.ts') && !path.endsWith('.tsx') && !path.endsWith('.js') && !path.endsWith('.jsx')) {
          return match; // Keep as-is for now, Lovable handles this
        }
        return match;
      }
    );

    // Ensure proper Lucide React imports
    fixed = fixed.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"]/g,
      'import { $1 } from "lucide-react"'
    );

    return fixed;
  }

  private addMissingExports(code: string): string {
    // Check if there's a component but no export
    const hasComponentDefinition = /(?:function|const)\s+[A-Z]\w*/.test(code);
    const hasExport = /export\s+(?:default|{)/.test(code);
    
    if (hasComponentDefinition && !hasExport) {
      // Find the main component name
      const componentMatch = code.match(/(?:function|const)\s+([A-Z]\w*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        return code + `\n\nexport default ${componentName};`;
      }
    }

    return code;
  }

  // Simulate TypeScript error detection (in a real implementation, this would use the TypeScript compiler API)
  private detectTypeScriptErrors(code: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for common TypeScript error patterns
      if (line.includes('any') && !line.includes('// @ts-ignore')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('any'),
          message: 'Parameter implicitly has an "any" type',
          code: 'TS7006',
          severity: 'error'
        });
      }

      if (line.match(/<[A-Z]/) && !code.includes('import React')) {
        errors.push({
          line: index + 1,
          column: 0,
          message: 'JSX element used without importing React',
          code: 'TS2304',
          severity: 'error'
        });
      }
    });

    return errors;
  }
}

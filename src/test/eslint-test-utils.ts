
// ESLint Test Utilities
export const mockCodeSamples = {
  valid: `
import React from 'react';

const Component = ({ title }: { title: string }) => {
  return <div>{title}</div>;
};

export default Component;
  `,
  withWarnings: `
import React from 'react';

const Component = () => {
  let unused = "variable"
  console.log("debug message")
  const x = 5
  return <div>Component</div>
}

export default Component
  `,
  withErrors: `
import React from 'react';

const Component = () => {
  undefinedFunction();
  return <div>{undefinedVariable}</div>;
};

export default Component;
  `,
  withSecurityIssues: `
const Component = () => {
  eval("console.log('dangerous')");
  const html = "<script>alert('xss')</script>";
  document.innerHTML = html;
  return null;
};
  `,
  malformed: `
const Component = () => {
  return <div>
    <span>Unclosed tag
  </div>
};
  `,
  large: Array(1000).fill(0).map((_, i) => `
const Component${i} = () => {
  const value${i} = ${i};
  return <div>{value${i}}</div>;
};
  `).join('\n')
};

export const mockESLintConfigs = {
  strict: {
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'error',
      'semi': 'error',
      'quotes': ['error', 'single'],
      'no-eval': 'error'
    }
  },
  relaxed: {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'semi': 'off'
    }
  },
  security: {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error'
    }
  }
};

export const generateMockProject = (id?: string) => ({
  id: id || crypto.randomUUID(),
  name: `Test Project ${Math.random().toString(36).substr(2, 9)}`,
  github_url: 'https://github.com/test/repo',
  language: 'typescript',
  framework: 'react',
  partner_id: crypto.randomUUID()
});

export const generateMockESLintResult = (projectId: string, filePath: string) => ({
  id: crypto.randomUUID(),
  project_id: projectId,
  file_path: filePath,
  issues: [
    {
      ruleId: 'no-unused-vars',
      severity: 1,
      message: 'Variable is unused',
      line: 5,
      column: 8,
      category: 'code_quality'
    },
    {
      ruleId: 'no-console',
      severity: 1,
      message: 'Unexpected console statement',
      line: 8,
      column: 3,
      category: 'style_violations'
    }
  ],
  severity_counts: { error: 0, warn: 2, info: 0 },
  quality_score: 85.5,
  total_issues: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const createLoadTestData = (numProjects: number, numFilesPerProject: number) => {
  const projects = Array(numProjects).fill(0).map(() => generateMockProject());
  const results = projects.flatMap(project => 
    Array(numFilesPerProject).fill(0).map((_, i) => 
      generateMockESLintResult(project.id, `src/components/Component${i}.tsx`)
    )
  );
  return { projects, results };
};

export const measurePerformance = async (fn: () => Promise<any>, label: string) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label}: ${end - start}ms`);
  return { result, duration: end - start };
};

export const validateAPIResponse = (response: any, schema: any) => {
  const errors: string[] = [];
  
  Object.keys(schema).forEach(key => {
    if (schema[key].required && !(key in response)) {
      errors.push(`Missing required field: ${key}`);
    }
    
    if (key in response && schema[key].type) {
      const actualType = typeof response[key];
      if (actualType !== schema[key].type) {
        errors.push(`Field ${key} should be ${schema[key].type}, got ${actualType}`);
      }
    }
  });
  
  return errors;
};

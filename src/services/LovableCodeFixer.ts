
import { LovableIssue, FixResult } from './LovableIntegration';

export interface LovableFixInstruction {
  step: number;
  action: string;
  codeToAdd?: string;
  codeToReplace?: string;
  fileLocation: string;
  lineNumber?: number;
  lovablePrompt: string;
}

export class LovableCodeFixer {
  async generateAndApplyFix(issue: LovableIssue): Promise<FixResult> {
    // Generate detailed fix instructions instead of attempting direct file modification
    let originalCode = '';
    let fixedCode = '';
    let instructions: LovableFixInstruction[] = [];
    
    switch (issue.type) {
      case 'typescript':
        originalCode = 'const data = fetchData();';
        fixedCode = `interface DataType {
  id: string;
  name: string;
}

const data: DataType = fetchData();`;
        instructions = [
          {
            step: 1,
            action: 'Add TypeScript interface',
            codeToAdd: 'interface DataType {\n  id: string;\n  name: string;\n}',
            fileLocation: 'Top of the file, after imports',
            lovablePrompt: 'Add a TypeScript interface called DataType with id and name properties of type string'
          },
          {
            step: 2,
            action: 'Update variable declaration',
            codeToReplace: 'const data = fetchData();',
            codeToAdd: 'const data: DataType = fetchData();',
            fileLocation: 'Where the variable is declared',
            lovablePrompt: 'Add type annotation DataType to the data variable declaration'
          }
        ];
        break;
        
      case 'error-boundary':
        originalCode = '<ComponentWithAPI />';
        fixedCode = `<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ComponentWithAPI />
</ErrorBoundary>`;
        instructions = [
          {
            step: 1,
            action: 'Import ErrorBoundary',
            codeToAdd: "import { ErrorBoundary } from 'react-error-boundary';",
            fileLocation: 'Top of the file with other imports',
            lovablePrompt: 'Add react-error-boundary import and wrap my component with ErrorBoundary that shows "Something went wrong" when errors occur'
          }
        ];
        break;
        
      case 'loading-state':
        originalCode = 'const { data } = useQuery(...)';
        fixedCode = `const { data, isLoading } = useQuery(...)

if (isLoading) return <div>Loading...</div>;`;
        instructions = [
          {
            step: 1,
            action: 'Extract isLoading from useQuery',
            codeToReplace: 'const { data } = useQuery(...)',
            codeToAdd: 'const { data, isLoading } = useQuery(...)',
            fileLocation: 'Where useQuery is called',
            lovablePrompt: 'Add isLoading to my useQuery destructuring and show a loading state'
          }
        ];
        break;
        
      case 'responsive':
        originalCode = '<div className="w-96">';
        fixedCode = '<div className="w-full max-w-96 md:w-96">';
        instructions = [
          {
            step: 1,
            action: 'Make width responsive',
            codeToReplace: 'w-96',
            codeToAdd: 'w-full max-w-96 md:w-96',
            fileLocation: 'In the className attribute',
            lovablePrompt: 'Make this div responsive by using w-full max-w-96 md:w-96 instead of fixed width'
          }
        ];
        break;
        
      default:
        throw new Error(`No fix available for issue type: ${issue.type}`);
    }

    console.log(`Generated fix instructions for ${issue.type}:`, instructions);
    
    return {
      issueId: issue.id,
      success: true,
      originalCode,
      fixedCode,
      instructions
    };
  }

  async applyAutoFixes(issueIds: string[], issues: LovableIssue[]): Promise<FixResult[]> {
    console.log('Generating fix instructions for issues:', issueIds);
    
    const results: FixResult[] = [];
    
    for (const issueId of issueIds) {
      const issue = issues.find(i => i.id === issueId);
      if (!issue || !issue.autoFixable) {
        results.push({
          issueId,
          success: false,
          originalCode: '',
          fixedCode: '',
          error: 'Issue not found or not auto-fixable'
        });
        continue;
      }

      try {
        const fixResult = await this.generateAndApplyFix(issue);
        results.push(fixResult);
      } catch (error: any) {
        results.push({
          issueId,
          success: false,
          originalCode: '',
          fixedCode: '',
          error: error.message
        });
      }
    }
    
    return results;
  }

  generateDiff(original: string, fixed: string): string {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');
    
    let diff = '';
    originalLines.forEach(line => diff += `- ${line}\n`);
    fixedLines.forEach(line => diff += `+ ${line}\n`);
    
    return diff;
  }

  generateLovablePromptForIssue(issue: LovableIssue): string {
    switch (issue.type) {
      case 'typescript':
        return `Add proper TypeScript interfaces and types to improve type safety. Create an interface for the data structure and add type annotations to variables.`;
      
      case 'error-boundary':
        return `Wrap this component with an ErrorBoundary from react-error-boundary that shows a user-friendly error message when something goes wrong.`;
      
      case 'loading-state':
        return `Add loading states to this component. Extract isLoading from useQuery and show a loading spinner or skeleton while data is being fetched.`;
      
      case 'responsive':
        return `Make this layout responsive by replacing fixed widths with responsive Tailwind classes like w-full max-w-96 md:w-96 for mobile-first design.`;
      
      case 'incomplete-component':
        return `Complete this component implementation by replacing TODO comments with actual functionality and removing placeholder content.`;
      
      default:
        return `Fix the ${issue.type} issue in this component.`;
    }
  }

  generateCopyableFixCode(issue: LovableIssue): string {
    switch (issue.type) {
      case 'typescript':
        return `// Add this interface at the top of your file:
interface DataType {
  id: string;
  name: string;
}

// Then update your variable declaration:
const data: DataType = fetchData();`;

      case 'error-boundary':
        return `// First, install react-error-boundary if not already installed
// Then wrap your component:
<ErrorBoundary fallback={<div className="p-4 text-red-600">Something went wrong</div>}>
  <YourComponent />
</ErrorBoundary>`;

      case 'loading-state':
        return `// Update your useQuery call:
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
});

// Add loading state:
if (isLoading) return <div className="p-4">Loading...</div>;
if (error) return <div className="p-4 text-red-600">Error loading data</div>;`;

      case 'responsive':
        return `// Replace fixed width classes:
// Before: className="w-96"
// After: className="w-full max-w-96 md:w-96"

// For containers:
// Before: className="w-80 h-64"
// After: className="w-full max-w-80 h-auto md:h-64"`;

      default:
        return '// No specific fix code available for this issue type';
    }
  }
}

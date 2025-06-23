
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
  originalLineNumber?: number;
  changeId?: string; // Links related changes with the same ID
  changeColor?: string; // Color for highlighting this change
  changeDescription?: string; // Human-readable description of the change
}

export interface DiffResult {
  beforeLines: DiffLine[];
  afterLines: DiffLine[];
  summary: {
    additions: number;
    deletions: number;
    unchanged: number;
    changePairs: number;
  };
  changeDescriptions: Array<{
    changeId: string;
    color: string;
    description: string;
  }>;
}

export class DiffGenerator {
  private static readonly COLOR_PALETTE = [
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', name: 'purple' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', name: 'orange' },
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', name: 'blue' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', name: 'teal' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', name: 'pink' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', name: 'indigo' },
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', name: 'emerald' },
    { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', name: 'rose' }
  ];

  static generateDiff(originalCode: string, fixedCode: string): DiffResult {
    const originalLines = originalCode.split('\n');
    const fixedLines = fixedCode.split('\n');
    
    const beforeLines: DiffLine[] = [];
    const afterLines: DiffLine[] = [];
    const changeDescriptions: Array<{ changeId: string; color: string; description: string; }> = [];
    
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    let changePairs = 0;
    let colorIndex = 0;

    // Simple line-by-line comparison with smart change detection
    const maxLines = Math.max(originalLines.length, fixedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const fixedLine = fixedLines[i] || '';
      
      if (i >= originalLines.length) {
        // Line added in fixed version
        const changeId = `change-${changePairs}`;
        const color = this.COLOR_PALETTE[colorIndex % this.COLOR_PALETTE.length];
        
        beforeLines.push({
          type: 'unchanged',
          content: '',
          lineNumber: undefined
        });
        afterLines.push({
          type: 'added',
          content: fixedLine,
          lineNumber: i + 1,
          changeId,
          changeColor: color.name,
          changeDescription: this.generateChangeDescription(originalLine, fixedLine, 'added')
        });
        
        changeDescriptions.push({
          changeId,
          color: color.name,
          description: this.generateChangeDescription(originalLine, fixedLine, 'added')
        });
        
        additions++;
        changePairs++;
        colorIndex++;
      } else if (i >= fixedLines.length) {
        // Line removed from original
        const changeId = `change-${changePairs}`;
        const color = this.COLOR_PALETTE[colorIndex % this.COLOR_PALETTE.length];
        
        beforeLines.push({
          type: 'removed',
          content: originalLine,
          originalLineNumber: i + 1,
          changeId,
          changeColor: color.name,
          changeDescription: this.generateChangeDescription(originalLine, fixedLine, 'removed')
        });
        afterLines.push({
          type: 'unchanged',
          content: '',
          lineNumber: undefined
        });
        
        changeDescriptions.push({
          changeId,
          color: color.name,
          description: this.generateChangeDescription(originalLine, fixedLine, 'removed')
        });
        
        deletions++;
        changePairs++;
        colorIndex++;
      } else if (originalLine === fixedLine) {
        // Line unchanged
        beforeLines.push({
          type: 'unchanged',
          content: originalLine,
          originalLineNumber: i + 1
        });
        afterLines.push({
          type: 'unchanged',
          content: fixedLine,
          lineNumber: i + 1
        });
        unchanged++;
      } else {
        // Line modified - this is a change pair
        const changeId = `change-${changePairs}`;
        const color = this.COLOR_PALETTE[colorIndex % this.COLOR_PALETTE.length];
        const description = this.generateChangeDescription(originalLine, fixedLine, 'modified');
        
        beforeLines.push({
          type: 'removed',
          content: originalLine,
          originalLineNumber: i + 1,
          changeId,
          changeColor: color.name,
          changeDescription: description
        });
        afterLines.push({
          type: 'added',
          content: fixedLine,
          lineNumber: i + 1,
          changeId,
          changeColor: color.name,
          changeDescription: description
        });
        
        changeDescriptions.push({
          changeId,
          color: color.name,
          description
        });
        
        deletions++;
        additions++;
        changePairs++;
        colorIndex++;
      }
    }
    
    return {
      beforeLines,
      afterLines,
      summary: { additions, deletions, unchanged, changePairs },
      changeDescriptions
    };
  }

  private static generateChangeDescription(originalLine: string, fixedLine: string, type: 'added' | 'removed' | 'modified'): string {
    // Generate human-readable descriptions of common TypeScript fixes
    if (type === 'added') {
      if (fixedLine.includes('interface')) return 'Added TypeScript interface definition';
      if (fixedLine.includes('import')) return 'Added missing import statement';
      if (fixedLine.includes('export')) return 'Added export statement';
      if (fixedLine.includes(': React.FC')) return 'Added React component type';
      return 'Added missing code';
    }
    
    if (type === 'removed') {
      return 'Removed problematic code';
    }
    
    // Modified lines
    if (originalLine.includes('function') && fixedLine.includes(': React.FC')) {
      return 'Converted function to typed React component';
    }
    if (!originalLine.includes(':') && fixedLine.includes(':')) {
      return 'Added type annotation';
    }
    if (originalLine.includes('any') && !fixedLine.includes('any')) {
      return 'Replaced "any" with specific type';
    }
    if (!originalLine.includes('interface') && fixedLine.includes('interface')) {
      return 'Added interface for props';
    }
    
    return 'Fixed TypeScript error';
  }

  static getColorClasses(colorName: string) {
    const color = this.COLOR_PALETTE.find(c => c.name === colorName);
    return color || this.COLOR_PALETTE[0];
  }
}

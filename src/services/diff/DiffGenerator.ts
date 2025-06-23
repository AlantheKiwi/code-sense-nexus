export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
  originalLineNumber?: number;
}

export interface DiffResult {
  beforeLines: DiffLine[];
  afterLines: DiffLine[];
  summary: {
    additions: number;
    deletions: number;
    unchanged: number;
  };
}

export class DiffGenerator {
  static generateDiff(originalCode: string, fixedCode: string): DiffResult {
    const originalLines = originalCode.split('\n');
    const fixedLines = fixedCode.split('\n');
    
    const beforeLines: DiffLine[] = [];
    const afterLines: DiffLine[] = [];
    
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    
    // Simple line-by-line comparison for now
    // In a production app, you'd use a more sophisticated diff algorithm
    const maxLines = Math.max(originalLines.length, fixedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const fixedLine = fixedLines[i] || '';
      
      if (i >= originalLines.length) {
        // Line added in fixed version
        beforeLines.push({
          type: 'unchanged',
          content: '',
          lineNumber: undefined
        });
        afterLines.push({
          type: 'added',
          content: fixedLine,
          lineNumber: i + 1
        });
        additions++;
      } else if (i >= fixedLines.length) {
        // Line removed from original
        beforeLines.push({
          type: 'removed',
          content: originalLine,
          originalLineNumber: i + 1
        });
        afterLines.push({
          type: 'unchanged',
          content: '',
          lineNumber: undefined
        });
        deletions++;
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
        // Line modified
        beforeLines.push({
          type: 'removed',
          content: originalLine,
          originalLineNumber: i + 1
        });
        afterLines.push({
          type: 'added',
          content: fixedLine,
          lineNumber: i + 1
        });
        deletions++;
        additions++;
      }
    }
    
    return {
      beforeLines,
      afterLines,
      summary: { additions, deletions, unchanged }
    };
  }
}


import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CodeComparisonProps {
  originalCode: string;
  fixedCode: string;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({ originalCode, fixedCode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const originalLines = originalCode.split('\n');
  const fixedLines = fixedCode.split('\n');
  const maxLines = Math.max(originalLines.length, fixedLines.length);

  // Synchronize scrolling between both panels
  const handleScroll = (source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const other = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (other) {
      other.scrollTop = target.scrollTop;
    }
  };

  // Simple line change detection
  const isLineChanged = (lineIndex: number): { left: boolean; right: boolean } => {
    const originalLine = originalLines[lineIndex] || '';
    const fixedLine = fixedLines[lineIndex] || '';
    
    // If lines are identical, no change
    if (originalLine === fixedLine) {
      return { left: false, right: false };
    }
    
    // If original exists but fixed doesn't, it's removed
    if (originalLine && !fixedLine) {
      return { left: true, right: false };
    }
    
    // If fixed exists but original doesn't, it's added
    if (!originalLine && fixedLine) {
      return { left: false, right: true };
    }
    
    // If both exist but different, both are changed
    return { left: true, right: true };
  };

  const renderCodePanel = (lines: string[], side: 'left' | 'right') => {
    return (
      <div 
        className={`flex-1 overflow-auto ${isExpanded ? 'max-h-none' : 'max-h-96'}`}
        ref={side === 'left' ? leftScrollRef : rightScrollRef}
        onScroll={handleScroll(side)}
      >
        <pre className="text-sm font-mono">
          <code>
            {Array.from({ length: maxLines }, (_, i) => {
              const line = lines[i] || '';
              const { left, right } = isLineChanged(i);
              const isHighlighted = (side === 'left' && left) || (side === 'right' && right);
              const bgColor = side === 'left' 
                ? (isHighlighted ? 'bg-red-50 border-l-2 border-red-300' : '')
                : (isHighlighted ? 'bg-green-50 border-l-2 border-green-300' : '');
              
              return (
                <div 
                  key={i} 
                  className={`flex min-h-[1.25rem] ${bgColor} ${isHighlighted ? 'px-2 -mx-2' : ''}`}
                >
                  <span className="text-gray-400 w-8 text-right mr-4 select-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{line || ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Before Panel */}
          <div className="bg-gray-50">
            <div className="bg-red-100 px-4 py-2 border-b border-red-200">
              <h4 className="font-semibold text-red-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Before (Problematic Code)
              </h4>
            </div>
            <div className="p-4">
              {renderCodePanel(originalLines, 'left')}
            </div>
          </div>

          {/* After Panel */}
          <div className="bg-gray-50">
            <div className="bg-green-100 px-4 py-2 border-b border-green-200">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                After (Optimized Code)
              </h4>
            </div>
            <div className="p-4">
              {renderCodePanel(fixedLines, 'right')}
            </div>
          </div>
        </div>
      </Card>

      {/* Expand/Collapse Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less Code
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View Full Code
            </>
          )}
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border-l-2 border-red-300 rounded-sm"></div>
          <span>Removed/Problematic lines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 border-l-2 border-green-300 rounded-sm"></div>
          <span>Added/Improved lines</span>
        </div>
      </div>
    </div>
  );
};

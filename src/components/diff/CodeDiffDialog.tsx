
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, X, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import { DiffGenerator, DiffLine } from '@/services/diff/DiffGenerator';
import { toast } from 'sonner';

interface FileResult {
  path: string;
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

interface CodeDiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileResult | null;
}

interface CodeBlockProps {
  lines: DiffLine[];
  title: string;
  code: string;
  hoveredChangeId: string | null;
  onLineHover: (changeId: string | null) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ lines, title, code, hoveredChangeId, onLineHover }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success(`${title} code copied to clipboard`);
  };

  return (
    <div className="flex-1 border rounded-lg">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h4 className="font-medium text-sm">{title}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="h-7 px-2"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </div>
      <ScrollArea className="h-96">
        <div className="font-mono text-sm">
          {lines.map((line, index) => {
            const colorClasses = line.changeColor ? DiffGenerator.getColorClasses(line.changeColor) : null;
            const isHovered = line.changeId && hoveredChangeId === line.changeId;
            
            return (
              <div
                key={index}
                className={`flex items-start px-3 py-1 transition-all duration-200 ${
                  line.type === 'added' && line.changeColor
                    ? `${colorClasses?.bg} ${colorClasses?.border} border-l-4 ${isHovered ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`
                    : line.type === 'removed' && line.changeColor
                    ? `${colorClasses?.bg} ${colorClasses?.border} border-l-4 ${isHovered ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`
                    : line.type === 'added'
                    ? 'bg-green-50 border-l-2 border-green-400'
                    : line.type === 'removed'
                    ? 'bg-red-50 border-l-2 border-red-400'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onMouseEnter={() => line.changeId && onLineHover(line.changeId)}
                onMouseLeave={() => line.changeId && onLineHover(null)}
              >
                <div className="flex items-center w-12 text-gray-400 text-xs mr-3">
                  {line.type === 'added' && (
                    <Plus className="h-3 w-3 text-green-600 mr-1" />
                  )}
                  {line.type === 'removed' && (
                    <Minus className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span>
                    {line.lineNumber || line.originalLineNumber || ''}
                  </span>
                </div>
                <div className="flex-1 whitespace-pre-wrap break-all">
                  {line.content || '\u00A0'}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const ChangeLegend: React.FC<{ changeDescriptions: Array<{ changeId: string; color: string; description: string; }> }> = ({ 
  changeDescriptions 
}) => {
  if (changeDescriptions.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Changes Made (Lines with matching colors show what was fixed)
      </h4>
      <div className="space-y-2">
        {changeDescriptions.map((change, index) => {
          const colorClasses = DiffGenerator.getColorClasses(change.color);
          return (
            <div key={change.changeId} className="flex items-center gap-3 text-sm">
              <div className={`w-4 h-4 rounded ${colorClasses.bg} ${colorClasses.border} border-2`}></div>
              <span className={`font-medium ${colorClasses.text}`}>
                Change {index + 1}:
              </span>
              <span className="text-gray-700">{change.description}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
        💡 <strong>How to read this:</strong> Lines highlighted in the same color on both sides show you exactly what was broken (left) and how it was fixed (right). Hover over colored lines to see matching changes.
      </div>
    </div>
  );
};

export const CodeDiffDialog: React.FC<CodeDiffDialogProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const [hoveredChangeId, setHoveredChangeId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  if (!file) return null;

  const diffResult = DiffGenerator.generateDiff(file.originalCode, file.fixedCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-mono text-lg">
                {file.path}
              </DialogTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {file.errorsFixed} errors fixed
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className="h-8 px-3 text-sm"
              >
                {showLegend ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide Guide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show Guide
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-green-600" />
              {diffResult.summary.additions} additions
            </span>
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-red-600" />
              {diffResult.summary.deletions} deletions
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-blue-600" />
              {diffResult.summary.changePairs} fixes
            </span>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {showLegend && <ChangeLegend changeDescriptions={diffResult.changeDescriptions} />}

          <div className="flex gap-4 h-full">
            <CodeBlock
              lines={diffResult.beforeLines}
              title="Before (Original with Errors)"
              code={file.originalCode}
              hoveredChangeId={hoveredChangeId}
              onLineHover={setHoveredChangeId}
            />
            <CodeBlock
              lines={diffResult.afterLines}
              title="After (Fixed and Ready to Deploy)"
              code={file.fixedCode}
              hoveredChangeId={hoveredChangeId}
              onLineHover={setHoveredChangeId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

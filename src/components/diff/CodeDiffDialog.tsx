
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, X, Plus, Minus } from 'lucide-react';
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
}

const CodeBlock: React.FC<CodeBlockProps> = ({ lines, title, code }) => {
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
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex items-start px-3 py-1 ${
                line.type === 'added'
                  ? 'bg-green-50 border-l-2 border-green-400'
                  : line.type === 'removed'
                  ? 'bg-red-50 border-l-2 border-red-400'
                  : 'bg-white hover:bg-gray-50'
              }`}
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const CodeDiffDialog: React.FC<CodeDiffDialogProps> = ({
  isOpen,
  onClose,
  file
}) => {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
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
          </div>

          <div className="text-sm text-gray-600">
            <strong>Changes made:</strong>
            <ul className="list-disc list-inside mt-1">
              {file.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          </div>
        </DialogHeader>

        <div className="flex gap-4 px-6 pb-6 h-full">
          <CodeBlock
            lines={diffResult.beforeLines}
            title="Before (Original)"
            code={file.originalCode}
          />
          <CodeBlock
            lines={diffResult.afterLines}
            title="After (Fixed)"
            code={file.fixedCode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

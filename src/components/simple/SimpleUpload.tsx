
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleUploadProps {
  code: string;
  onCodeChange: (code: string) => void;
  onFileUpload: (code: string) => void;
}

export const SimpleUpload: React.FC<SimpleUploadProps> = ({
  code,
  onCodeChange,
  onFileUpload
}) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ts') && !file.name.endsWith('.tsx')) {
      toast.error('Please upload a TypeScript file (.ts or .tsx)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        onCodeChange(text);
        toast.success('Code pasted from clipboard');
      } else {
        toast.error('Clipboard is empty');
      }
    } catch (error) {
      toast.error('Failed to read from clipboard');
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (!file) return;

    if (!file.name.endsWith('.ts') && !file.name.endsWith('.tsx')) {
      toast.error('Please drop a TypeScript file (.ts or .tsx)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Options */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-dashed border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardContent className="p-6 text-center">
            <input
              type="file"
              accept=".ts,.tsx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Upload File</p>
              <p className="text-sm text-gray-500">Select .ts or .tsx file</p>
            </label>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-green-200 hover:border-green-300 transition-colors">
          <CardContent className="p-6 text-center">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="cursor-pointer"
            >
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Drag & Drop</p>
              <p className="text-sm text-gray-500">Drop your TypeScript file here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-purple-200 hover:border-purple-300 transition-colors">
          <CardContent className="p-6 text-center">
            <Button
              onClick={handlePasteFromClipboard}
              variant="ghost"
              className="w-full h-full flex flex-col items-center justify-center p-0"
            >
              <Clipboard className="h-8 w-8 text-purple-500 mb-2" />
              <p className="font-medium text-gray-900">Paste Code</p>
              <p className="text-sm text-gray-500">From clipboard</p>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Code Editor */}
      <Card>
        <CardContent className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or paste your TypeScript code here:
          </label>
          <Textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="// Paste your TypeScript code here...
// Example:
function MyComponent({ title }) {
  const [count, setCount] = useState();
  return <div>{title}: {count}</div>;
}"
            className="min-h-[300px] font-mono text-sm"
          />
          {code && (
            <p className="text-sm text-gray-500 mt-2">
              {code.split('\n').length} lines of code ready to fix
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

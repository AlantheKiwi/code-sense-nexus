
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface CodePasteTabProps {
  onSingleCodeInput: (code: string) => void;
}

export const CodePasteTab: React.FC<CodePasteTabProps> = ({
  onSingleCodeInput
}) => {
  const [singleCode, setSingleCode] = useState('');

  const handleProcessSingleCode = () => {
    if (!singleCode.trim()) {
      toast.error('Please paste your TypeScript code');
      return;
    }
    onSingleCodeInput(singleCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Paste Your Code
        </CardTitle>
        <p className="text-gray-600">
          Copy and paste your TypeScript code that has errors
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={singleCode}
          onChange={(e) => setSingleCode(e.target.value)}
          placeholder="// Paste your TypeScript code here...
// Example:
function MyComponent({ title }) {
  const [count, setCount] = useState();
  return <div>{title}: {count}</div>;
}"
          className="w-full h-64 p-4 border rounded-lg font-mono text-sm resize-none"
        />
        
        {singleCode && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {singleCode.split('\n').length} lines of code ready to fix
            </p>
            <Button 
              onClick={handleProcessSingleCode}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fix This Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

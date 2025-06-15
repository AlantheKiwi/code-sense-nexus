
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const CodeEditor = ({ code, onCodeChange, onAnalyze, isAnalyzing }: CodeEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Shared Code Editor</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="font-mono h-64 bg-gray-900 text-green-400"
        placeholder="Enter your Javascript code here"
      />
      <Button onClick={onAnalyze} className="mt-4" disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
      </Button>
    </CardContent>
  </Card>
);

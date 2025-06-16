
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ToolSelectionGrid } from './ToolSelectionGrid';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
}

export const CodeEditor = ({ code, onCodeChange, onAnalyze, isAnalyzing }: CodeEditorProps) => (
  <div className="space-y-6">
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
      </CardContent>
    </Card>
    
    <ToolSelectionGrid 
      onAnalyze={onAnalyze}
      isAnalyzing={isAnalyzing}
    />
  </div>
);

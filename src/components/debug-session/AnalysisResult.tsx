
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisResultProps {
  result: any;
  isAnalyzing: boolean;
}

export const AnalysisResult = ({ result, isAnalyzing }: AnalysisResultProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Analysis Result</CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto h-40">
        {isAnalyzing
          ? 'Analyzing code...'
          : result
          ? JSON.stringify(result, null, 2)
          : 'No result yet. Click "Analyze Code" to run the analysis.'}
      </pre>
    </CardContent>
  </Card>
);

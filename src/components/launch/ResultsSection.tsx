
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Eye, Rocket } from 'lucide-react';
import { SimpleResults } from '@/components/simple/SimpleResults';
import { toast } from 'sonner';

interface FixResult {
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

interface MultiFileResult {
  files: Array<{
    path: string;
    originalCode: string;
    fixedCode: string;
    errorsFixed: number;
    description: string[];
  }>;
  totalErrorsFixed: number;
}

interface ResultsSectionProps {
  singleResult: FixResult | null;
  multiResult: MultiFileResult | null;
  onStartOver: () => void;
  onOpenDiffDialog: (file: MultiFileResult['files'][0]) => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  singleResult,
  multiResult,
  onStartOver,
  onOpenDiffDialog
}) => {
  const downloadAllFiles = () => {
    if (!multiResult) return;

    multiResult.files.forEach(file => {
      const blob = new Blob([file.fixedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast.success('All fixed files downloaded!');
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-800">
            <CheckCircle className="h-6 w-6" />
            Success! Fixed {singleResult?.errorsFixed || multiResult?.totalErrorsFixed} Errors
            {multiResult && ` Across ${multiResult.files.length} Files`}
          </CardTitle>
          <p className="text-green-700">
            Your TypeScript code is now ready to deploy - exactly as Lovable intended, just without the errors
          </p>
        </CardHeader>
      </Card>

      {singleResult && <SimpleResults result={singleResult} />}

      {multiResult && (
        <Card>
          <CardHeader>
            <CardTitle>Fixed Files Summary</CardTitle>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Safe & Surgical:</strong> We only fixed TypeScript errors - your app's functionality, 
                design, and features remain exactly as you built them in Lovable.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {multiResult.files.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium font-mono text-sm break-all pr-4">{file.path}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {file.errorsFixed} errors fixed
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDiffDialog(file)}
                        className="h-7 px-2"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Changes
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {file.description.map((desc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {multiResult.files.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing all {multiResult.files.length} fixed files. Scroll up to see more.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={onStartOver}
          variant="outline"
          size="lg"
          className="px-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Fix More Files
        </Button>
        {multiResult && (
          <Button
            onClick={downloadAllFiles}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Download All Fixed Files
          </Button>
        )}
        <Button
          onClick={() => window.open('https://lovable.app', '_blank')}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          <Rocket className="h-5 w-5 mr-2" />
          Deploy Now in Lovable
        </Button>
      </div>

      {/* Enhanced Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Apply These Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Download the fixed files using the button above</li>
            <li>Open your Lovable project and enable Dev Mode</li>
            <li>Replace the original files with the fixed versions</li>
            <li>Your project should now deploy without TypeScript errors!</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-700">
              <strong>Safe Process:</strong> We don't change your app's functionality - only fix the TypeScript 
              errors that prevent deployment. Your Lovable creation remains exactly as you designed it.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

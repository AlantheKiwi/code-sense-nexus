
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  FileText,
  Zap
} from 'lucide-react';
import { GitHubFile } from '@/services/github/GitHubConnector';

interface FilesPreviewProps {
  detectedFiles: GitHubFile[];
  onProcessFiles: () => void;
}

export const FilesPreview: React.FC<FilesPreviewProps> = ({
  detectedFiles,
  onProcessFiles
}) => {
  if (detectedFiles.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Found {detectedFiles.length} TypeScript Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {detectedFiles.slice(0, 6).map((file) => (
              <div key={file.path} className="flex items-center gap-2 bg-white p-2 rounded">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-mono">{file.path}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(file.size / 1024)}KB
                </Badge>
              </div>
            ))}
          </div>
          
          {detectedFiles.length > 6 && (
            <p className="text-sm text-gray-600">
              ...and {detectedFiles.length - 6} more files
            </p>
          )}

          <Button 
            onClick={onProcessFiles}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Zap className="h-5 w-5 mr-2" />
            Fix All {detectedFiles.length} TypeScript Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

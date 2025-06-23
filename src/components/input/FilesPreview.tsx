
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  FileText,
  Zap,
  FolderOpen,
  Code2
} from 'lucide-react';
import { GitHubFile } from '@/services/github/GitHubConnector';
import { RepositoryStatistics } from '@/services/github/types';

interface FilesPreviewProps {
  detectedFiles: GitHubFile[];
  onProcessFiles: () => void;
  repositoryName?: string;
  statistics?: RepositoryStatistics;
}

export const FilesPreview: React.FC<FilesPreviewProps> = ({
  detectedFiles,
  onProcessFiles,
  repositoryName,
  statistics
}) => {
  if (detectedFiles.length === 0) {
    return null;
  }

  const tsFiles = detectedFiles.filter(file => file.path.endsWith('.ts'));
  const tsxFiles = detectedFiles.filter(file => file.path.endsWith('.tsx'));

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Repository Scan Complete
        </CardTitle>
        {repositoryName && (
          <p className="text-sm text-green-700 font-medium">
            {repositoryName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Repository Statistics */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Files</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{statistics.totalFiles}</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center border-2 border-blue-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Code2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">TypeScript</span>
                </div>
                <div className="text-lg font-bold text-blue-800">{statistics.typeScriptFiles}</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-indigo-600">.ts Files</span>
                </div>
                <div className="text-lg font-bold text-indigo-800">{statistics.tsFiles}</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600">.tsx Files</span>
                </div>
                <div className="text-lg font-bold text-purple-800">{statistics.tsxFiles}</div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Found {detectedFiles.length} TypeScript files ready for error analysis</span>
            </div>
            {tsFiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <FileText className="h-4 w-4" />
                <span>{tsFiles.length} TypeScript files (.ts)</span>
              </div>
            )}
            {tsxFiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <FileText className="h-4 w-4" />
                <span>{tsxFiles.length} React TypeScript files (.tsx)</span>
              </div>
            )}
          </div>
          
          {/* File Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {detectedFiles.slice(0, 6).map((file) => (
              <div key={file.path} className="flex items-center gap-2 bg-white p-2 rounded">
                <FileText className={`h-4 w-4 ${file.path.endsWith('.tsx') ? 'text-purple-500' : 'text-blue-500'}`} />
                <span className="text-sm font-mono truncate">{file.path}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {Math.round(file.size / 1024)}KB
                </Badge>
              </div>
            ))}
          </div>
          
          {detectedFiles.length > 6 && (
            <p className="text-sm text-gray-600 text-center">
              ...and {detectedFiles.length - 6} more TypeScript files
            </p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Next:</strong> Analyze these TypeScript files for common errors like:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Missing type annotations</li>
              <li>Unused variables and imports</li>
              <li>Type mismatches and compatibility issues</li>
              <li>React component prop typing</li>
            </ul>
          </div>

          <Button 
            onClick={onProcessFiles}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Zap className="h-5 w-5 mr-2" />
            Analyze & Fix {detectedFiles.length} TypeScript Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

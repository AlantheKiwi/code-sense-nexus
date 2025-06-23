
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderOpen, 
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { GitHubFile } from '@/services/github/GitHubConnector';

interface FileUploadTabProps {
  onFilesDetected: (files: GitHubFile[]) => void;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  onFilesDetected
}) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const tsFiles: GitHubFile[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
      if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          tsFiles.push({
            path: file.name,
            name: file.name,
            content,
            size: file.size,
            type: 'file',
            sha: ''
          });
          
          filesProcessed++;
          if (filesProcessed === files.length) {
            if (tsFiles.length > 0) {
              onFilesDetected(tsFiles);
              toast.success(`Uploaded ${tsFiles.length} TypeScript files`);
            } else {
              toast.error('No TypeScript files found in upload');
            }
          }
        };
        reader.readAsText(file);
      } else {
        filesProcessed++;
      }
    });
  }, [onFilesDetected]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-green-600" />
          Upload Your Project Files
        </CardTitle>
        <p className="text-gray-600">
          Select multiple TypeScript files or drag and drop your entire project folder
        </p>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
          <input
            type="file"
            multiple
            accept=".ts,.tsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-multiple"
          />
          <label htmlFor="file-upload-multiple" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop TypeScript files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports .ts and .tsx files
            </p>
          </label>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mt-4">
          <h4 className="font-medium text-green-800 mb-2">How to download from Lovable:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. In Lovable, click the Dev Mode toggle</li>
            <li>2. Right-click on files and select "Download"</li>
            <li>3. Upload the downloaded files here</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Github, 
  Upload, 
  FileText
} from 'lucide-react';
import { GitHubFile } from '@/services/github/GitHubConnector';
import { GitHubRepoTab } from './GitHubRepoTab';
import { FileUploadTab } from './FileUploadTab';
import { CodePasteTab } from './CodePasteTab';
import { FilesPreview } from './FilesPreview';

interface SeamlessFileInputProps {
  onFilesDetected: (files: GitHubFile[]) => void;
  onSingleCodeInput: (code: string) => void;
}

export const SeamlessFileInput: React.FC<SeamlessFileInputProps> = ({
  onFilesDetected,
  onSingleCodeInput
}) => {
  const [detectedFiles, setDetectedFiles] = useState<GitHubFile[]>([]);

  const handleFilesDetected = (files: GitHubFile[]) => {
    setDetectedFiles(files);
  };

  const handleProcessFiles = () => {
    if (detectedFiles.length > 0) {
      onFilesDetected(detectedFiles);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Link
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Paste Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="space-y-4">
          <GitHubRepoTab onFilesDetected={handleFilesDetected} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadTab onFilesDetected={handleFilesDetected} />
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <CodePasteTab onSingleCodeInput={onSingleCodeInput} />
        </TabsContent>
      </Tabs>

      <FilesPreview 
        detectedFiles={detectedFiles} 
        onProcessFiles={handleProcessFiles} 
      />
    </div>
  );
};

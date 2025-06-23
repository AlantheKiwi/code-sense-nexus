
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Github, 
  Upload, 
  FileText, 
  FolderOpen, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Key,
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { gitHubConnector, GitHubFile } from '@/services/github/GitHubConnector';

interface SeamlessFileInputProps {
  onFilesDetected: (files: GitHubFile[]) => void;
  onSingleCodeInput: (code: string) => void;
}

export const SeamlessFileInput: React.FC<SeamlessFileInputProps> = ({
  onFilesDetected,
  onSingleCodeInput
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFiles, setDetectedFiles] = useState<GitHubFile[]>([]);
  const [singleCode, setSingleCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  const handleGitHubScan = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    
    try {
      // First verify the repository
      const verification = await gitHubConnector.verifyRepository(githubUrl, githubToken || undefined);
      
      if (!verification.exists && verification.error) {
        setScanError(verification.error.message + (verification.error.suggestion ? ` ${verification.error.suggestion}` : ''));
        
        // If it's a forbidden error, suggest using a token
        if (verification.error.code === 'FORBIDDEN' || verification.error.code === 'NOT_FOUND') {
          setShowTokenInput(true);
        }
        return;
      }

      const repoContent = await gitHubConnector.fetchRepository(githubUrl, githubToken || undefined);
      
      // Filter for TypeScript files
      const tsFiles = repoContent.files.filter(file => 
        file.path.endsWith('.ts') || file.path.endsWith('.tsx')
      );

      if (tsFiles.length === 0) {
        toast.warning('No TypeScript files found in this repository');
        setScanError('No TypeScript files found. Make sure this is a TypeScript/React project.');
        return;
      }

      setDetectedFiles(tsFiles);
      setScanError(null);
      toast.success(`Found ${tsFiles.length} TypeScript files!`);
    } catch (error) {
      console.error('GitHub scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan repository';
      setScanError(errorMessage);
      toast.error('Failed to scan repository. Please check the details below.');
    } finally {
      setIsScanning(false);
    }
  };

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
              setDetectedFiles(tsFiles);
              setScanError(null);
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
  }, []);

  const handleProcessFiles = () => {
    if (detectedFiles.length > 0) {
      onFilesDetected(detectedFiles);
    }
  };

  const handleProcessSingleCode = () => {
    if (!singleCode.trim()) {
      toast.error('Please paste your TypeScript code');
      return;
    }
    onSingleCodeInput(singleCode);
  };

  const clearError = () => {
    setScanError(null);
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-blue-600" />
                Connect Your Lovable Project
              </CardTitle>
              <p className="text-gray-600">
                Paste your GitHub repository URL and we'll automatically find all TypeScript files
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/username/your-lovable-project"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    if (scanError) clearError();
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGitHubScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Scan Project
                    </>
                  )}
                </Button>
              </div>

              {/* GitHub Token Input */}
              {showTokenInput && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium">GitHub Personal Access Token (Optional)</label>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                    >
                      Get Token <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Required for private repositories or to avoid rate limits
                  </p>
                </div>
              )}

              {/* Error Display */}
              {scanError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {scanError}
                    {!showTokenInput && scanError.includes('private') && (
                      <Button
                        variant="link"
                        className="h-auto p-0 ml-2 text-red-600"
                        onClick={() => setShowTokenInput(true)}
                      >
                        Add GitHub Token
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How to find your GitHub link:
                </h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Open your Lovable project</li>
                  <li>2. Click the "GitHub" button in the top right</li>
                  <li>3. Copy the repository URL and paste it above</li>
                </ol>
                <div className="mt-3 text-xs text-blue-600">
                  <p className="font-medium">Supported URL formats:</p>
                  <ul className="mt-1 space-y-1 font-mono">
                    <li>• https://github.com/username/repository</li>
                    <li>• github.com/username/repository</li>
                    <li>• username/repository</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
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
        </TabsContent>
      </Tabs>

      {/* Detected Files Preview */}
      {detectedFiles.length > 0 && (
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
                onClick={handleProcessFiles}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Zap className="h-5 w-5 mr-2" />
                Fix All {detectedFiles.length} TypeScript Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

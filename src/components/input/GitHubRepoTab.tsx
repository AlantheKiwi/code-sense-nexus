
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Github, 
  Zap, 
  Loader2,
  Key,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { gitHubConnector, GitHubFile } from '@/services/github/GitHubConnector';

interface GitHubRepoTabProps {
  onFilesDetected: (files: GitHubFile[]) => void;
}

export const GitHubRepoTab: React.FC<GitHubRepoTabProps> = ({
  onFilesDetected
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const clearError = () => {
    setScanError(null);
  };

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

      onFilesDetected(tsFiles);
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

  return (
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
  );
};

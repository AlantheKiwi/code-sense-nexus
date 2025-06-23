
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Github, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Key
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { gitHubConnector, GitHubFile } from '@/services/github/GitHubConnector';
import { RepositoryStatistics, GitHubProgress } from '@/services/github/types';

interface GitHubRepoTabProps {
  onFilesDetected: (files: GitHubFile[], repositoryName?: string, statistics?: RepositoryStatistics) => void;
}

export const GitHubRepoTab: React.FC<GitHubRepoTabProps> = ({
  onFilesDetected
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [progress, setProgress] = useState<GitHubProgress | null>(null);

  const handleConnect = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsVerified(false);
    setProgress(null);

    try {
      const repositoryContent = await gitHubConnector.fetchRepository(
        repoUrl, 
        githubToken || undefined,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );
      
      if (repositoryContent.files.length === 0) {
        toast.error('No TypeScript files found in this repository');
        return;
      }

      setIsVerified(true);
      onFilesDetected(
        repositoryContent.files, 
        repositoryContent.repository.fullName,
        repositoryContent.statistics
      );
      
      toast.success(`Successfully connected to ${repositoryContent.repository.fullName}`);
    } catch (error) {
      console.error('Repository connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to repository';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5 text-blue-600" />
          Connect GitHub Repository
        </CardTitle>
        <p className="text-gray-600">
          Connect your Lovable project's GitHub repository to automatically detect TypeScript files
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repo-url">Repository URL</Label>
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/username/repository-name"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-token" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            GitHub Token (Optional)
          </Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Required for private repositories. Get your token from GitHub Settings → Developer settings → Personal access tokens
          </p>
        </div>

        {/* Progress Section */}
        {isLoading && progress && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {progress.message}
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-blue-600">
              <span>{progress.percentage}% complete</span>
              {progress.filesProcessed !== undefined && progress.totalFiles !== undefined && (
                <span>
                  {progress.filesProcessed}/{progress.totalFiles} files
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Repository connected successfully! TypeScript files detected and ready for analysis.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleConnect}
          disabled={isLoading || !repoUrl.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {progress ? 'Processing...' : 'Connecting...'}
            </>
          ) : (
            <>
              <Github className="h-4 w-4 mr-2" />
              Connect Repository
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">How to get your repository URL:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Open your Lovable project</li>
            <li>2. Click the GitHub button in the top right</li>
            <li>3. Copy the repository URL from GitHub</li>
            <li>4. Paste it here to scan for TypeScript files</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

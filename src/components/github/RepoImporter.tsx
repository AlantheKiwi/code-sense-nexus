
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Github, 
  Lock, 
  Unlock, 
  FileText, 
  Shield, 
  Zap, 
  Search,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { gitHubConnector, RepositoryContent } from '@/services/github/GitHubConnector';
import { repositoryAuditor, AuditOptions } from '@/services/audit/RepositoryAuditor';

interface RepoImporterProps {
  onAuditComplete?: (auditId: string) => void;
  onAuditStart?: () => void;
}

export const RepoImporter: React.FC<RepoImporterProps> = ({ 
  onAuditComplete, 
  onAuditStart 
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [auditType, setAuditType] = useState<'security' | 'full' | 'quality' | 'performance'>('full');
  const [repositoryContent, setRepositoryContent] = useState<RepositoryContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [step, setStep] = useState<'input' | 'preview' | 'analyzing' | 'complete'>('input');

  const validateGitHubUrl = (url: string): boolean => {
    const patterns = [
      /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/,
      /^[^\/]+\/[^\/]+$/
    ];
    return patterns.some(pattern => pattern.test(url.trim()));
  };

  const handleRepoPreview = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      toast.error('Please enter a valid GitHub repository URL (e.g., owner/repo or https://github.com/owner/repo)');
      return;
    }

    setIsLoading(true);
    try {
      const content = await gitHubConnector.fetchRepository(repoUrl, githubToken || undefined);
      setRepositoryContent(content);
      setStep('preview');
      toast.success(`Repository loaded: ${content.filteredFiles} files ready for analysis`);
    } catch (error) {
      console.error('Failed to load repository:', error);
      toast.error(`Failed to load repository: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAudit = async () => {
    if (!repositoryContent) {
      toast.error('Please load a repository first');
      return;
    }

    setIsAnalyzing(true);
    setStep('analyzing');
    setAnalysisProgress(0);
    onAuditStart?.();

    const auditOptions: AuditOptions = {
      auditType,
      maxFiles: 50, // Limit for demo
      skipLargeFiles: true,
      focusOnCritical: auditType === 'security',
      includeTests: false
    };

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(95, prev + Math.random() * 10));
      }, 1000);

      const auditResult = await repositoryAuditor.auditRepository(
        repoUrl,
        auditOptions,
        githubToken || undefined
      );

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setStep('complete');
      
      toast.success(`Repository audit completed! Overall score: ${auditResult.overallScore}/100`);
      onAuditComplete?.(auditResult.id);

    } catch (error) {
      console.error('Repository audit failed:', error);
      toast.error(`Audit failed: ${error.message}`);
      setStep('preview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAuditTypeIcon = () => {
    switch (auditType) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAuditTypeDescription = () => {
    switch (auditType) {
      case 'security': return 'Comprehensive security vulnerability analysis across all files';
      case 'quality': return 'Code quality, maintainability, and best practices analysis';
      case 'performance': return 'Performance bottlenecks and optimization opportunities';
      case 'full': return 'Complete analysis including security, quality, and performance';
    }
  };

  const getAuditTypeCost = () => {
    switch (auditType) {
      case 'security': return '400+ credits';
      case 'full': return '600+ credits';
      default: return '200+ credits';
    }
  };

  if (step === 'analyzing') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">{repositoryContent?.repository.fullName}</div>
            <Progress value={analysisProgress} className="w-full" />
            <div className="text-sm text-gray-600">
              {analysisProgress < 30 && "Fetching repository files..."}
              {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing code quality..."}
              {analysisProgress >= 60 && analysisProgress < 90 && "Running security scans..."}
              {analysisProgress >= 90 && "Generating report..."}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Files Loaded: {repositoryContent?.filteredFiles}
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Audit Type: {auditType}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Import GitHub Repository
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'input' && (
          <>
            <div className="space-y-3">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="font-mono"
              />
              <div className="text-xs text-gray-500">
                Enter a GitHub repository URL or owner/repo format
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="github-token">
                GitHub Token (Optional)
                <Badge variant="secondary" className="ml-2">For Private Repos</Badge>
              </Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
              <div className="text-xs text-gray-500">
                Required for private repositories. Generate at GitHub Settings → Developer settings → Personal access tokens
              </div>
            </div>

            <Button 
              onClick={handleRepoPreview}
              disabled={isLoading || !repoUrl.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Repository...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Load Repository
                </>
              )}
            </Button>
          </>
        )}

        {step === 'preview' && repositoryContent && (
          <>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{repositoryContent.repository.fullName}</h3>
                <div className="flex items-center gap-2">
                  {repositoryContent.repository.isPrivate ? (
                    <Lock className="h-4 w-4 text-red-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                  <Badge variant="outline">
                    {repositoryContent.repository.language}
                  </Badge>
                </div>
              </div>
              
              {repositoryContent.repository.description && (
                <p className="text-sm text-gray-600">{repositoryContent.repository.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total Files: {repositoryContent.totalFiles}</div>
                <div>Analyzable Files: {repositoryContent.filteredFiles}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Audit Type</Label>
              <Select value={auditType} onValueChange={(value: any) => setAuditType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Full Audit (Recommended)
                    </div>
                  </SelectItem>
                  <SelectItem value="security">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Focus
                    </div>
                  </SelectItem>
                  <SelectItem value="quality">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Code Quality
                    </div>
                  </SelectItem>
                  <SelectItem value="performance">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Performance
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getAuditTypeIcon()}
                  <span className="font-medium">{auditType} Audit</span>
                  <Badge variant="outline">{getAuditTypeCost()}</Badge>
                </div>
                <p className="text-sm text-gray-600">{getAuditTypeDescription()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('input')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleStartAudit}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {getAuditTypeIcon()}
                Start {auditType} Audit
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Audit Complete!</h3>
              <p className="text-gray-600">Your repository analysis is ready for review.</p>
            </div>
            <Button onClick={() => setStep('input')} variant="outline">
              Analyze Another Repository
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { GitHubRepository, GitHubFile, GitHubError, ProgressCallback } from './types';
import { GitHubErrorHandler } from './errorHandler';
import { GitHubFileFilter } from './fileFilter';

export class GitHubApiClient {
  private baseUrl = 'https://api.github.com';
  private rateLimitRemaining = 5000;
  private rateLimitReset = 0;

  async getRepositoryInfo(owner: string, repo: string, token?: string, onProgress?: ProgressCallback): Promise<GitHubRepository> {
    const headers = this.buildHeaders(token);
    
    if (onProgress) {
      onProgress({
        percentage: 5,
        stage: 'verifying',
        message: 'Verifying repository access...'
      });
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { headers });
      
      this.updateRateLimits(response);
      
      if (!response.ok) {
        const error = GitHubErrorHandler.createErrorFromResponse(response, owner, repo);
        throw new Error(`${error.message}${error.suggestion ? ` ${error.suggestion}` : ''}`);
      }

      const data = await response.json();
      
      if (onProgress) {
        onProgress({
          percentage: 10,
          stage: 'verifying',
          message: 'Repository verified successfully'
        });
      }
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description || '',
        language: data.language || 'Unknown',
        size: data.size,
        isPrivate: data.private,
        defaultBranch: data.default_branch,
        url: data.html_url
      };
    } catch (error) {
      console.error('Failed to fetch repository info:', error);
      throw error;
    }
  }

  async getRepositoryFiles(owner: string, repo: string, branch: string, token?: string, onProgress?: ProgressCallback): Promise<GitHubFile[]> {
    const headers = this.buildHeaders(token);
    const files: GitHubFile[] = [];
    
    try {
      if (onProgress) {
        onProgress({
          percentage: 15,
          stage: 'fetching_tree',
          message: 'Getting repository file list...'
        });
      }

      // Get repository tree (recursive)
      const treeResponse = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers }
      );
      
      this.updateRateLimits(treeResponse);
      
      if (!treeResponse.ok) {
        const error = GitHubErrorHandler.createErrorFromResponse(treeResponse, owner, repo);
        throw new Error(`${error.message}${error.suggestion ? ` ${error.suggestion}` : ''}`);
      }

      const treeData = await treeResponse.json();
      
      // Filter and process files
      const fileItems = treeData.tree.filter((item: any) => 
        item.type === 'blob' && !GitHubFileFilter.shouldExcludeFile(item.path)
      );

      const totalFiles = Math.min(fileItems.length, 100); // Limit for demo
      console.log(`📁 Found ${fileItems.length} files to analyze (processing ${totalFiles})`);

      if (onProgress) {
        onProgress({
          percentage: 20,
          stage: 'downloading_files',
          message: `Found ${totalFiles} files to process`,
          filesProcessed: 0,
          totalFiles
        });
      }

      // Fetch content for files (with progress tracking)
      for (let i = 0; i < totalFiles; i++) {
        const item = fileItems[i];
        try {
          const content = await this.getFileContent(owner, repo, item.path, token);
          
          files.push({
            path: item.path,
            name: item.path.split('/').pop() || item.path,
            content,
            size: item.size || 0,
            type: 'file',
            sha: item.sha
          });

          // Report progress
          if (onProgress) {
            const filesProcessed = i + 1;
            const percentage = 20 + Math.floor((filesProcessed / totalFiles) * 75); // 20% to 95%
            onProgress({
              percentage,
              stage: 'downloading_files',
              message: `Downloading file contents...`,
              filesProcessed,
              totalFiles
            });
          }

          // Basic rate limiting
          if ((i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch content for ${item.path}:`, error);
        }
      }

      if (onProgress) {
        onProgress({
          percentage: 100,
          stage: 'processing',
          message: 'Processing complete!',
          filesProcessed: files.length,
          totalFiles
        });
      }

      return files;
    } catch (error) {
      console.error('Failed to fetch repository files:', error);
      throw error;
    }
  }

  async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
    const headers = this.buildHeaders(token);
    
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    
    this.updateRateLimits(response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    
    return data.content || '';
  }

  async verifyRepository(owner: string, repo: string, token?: string): Promise<{ exists: boolean; error?: GitHubError }> {
    try {
      const headers = this.buildHeaders(token);
      
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { 
        method: 'HEAD',
        headers 
      });
      
      this.updateRateLimits(response);
      
      if (response.ok) {
        return { exists: true };
      }
      
      const error = GitHubErrorHandler.createErrorFromResponse(response, owner, repo);
      return { exists: false, error };
    } catch (error) {
      console.error('Repository verification failed:', error);
      return { 
        exists: false, 
        error: {
          code: 'INVALID_URL',
          message: 'Invalid repository URL format',
          suggestion: 'Please check the URL format. Example: https://github.com/username/repository-name'
        }
      };
    }
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CodeSense-Security-Auditor'
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    return headers;
  }

  private updateRateLimits(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset) * 1000;
    
    console.log(`📊 GitHub API rate limit: ${this.rateLimitRemaining} requests remaining`);
  }

  getRateLimitStatus(): { remaining: number; resetTime: number } {
    return {
      remaining: this.rateLimitRemaining,
      resetTime: this.rateLimitReset
    };
  }
}

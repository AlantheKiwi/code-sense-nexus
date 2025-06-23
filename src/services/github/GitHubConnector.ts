export interface GitHubFile {
  path: string;
  name: string;
  content: string;
  size: number;
  type: 'file' | 'dir';
  sha: string;
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  description: string;
  language: string;
  size: number;
  isPrivate: boolean;
  defaultBranch: string;
  url: string;
}

export interface RepositoryContent {
  repository: GitHubRepository;
  files: GitHubFile[];
  totalFiles: number;
  filteredFiles: number;
}

export interface GitHubError {
  code: 'NOT_FOUND' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INVALID_URL' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  suggestion?: string;
}

export class GitHubConnector {
  private baseUrl = 'https://api.github.com';
  private rateLimitRemaining = 5000;
  private rateLimitReset = 0;

  // File extensions and paths to exclude from analysis
  private readonly EXCLUDED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.woff', '.woff2', '.ttf', '.eot',
    '.mp3', '.mp4', '.avi', '.mov', '.wav',
    '.lock', '.log'
  ];

  private readonly EXCLUDED_PATHS = [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    'coverage/',
    '.next/',
    '.nuxt/',
    'vendor/',
    '.vendor/',
    'tmp/',
    'temp/',
    '.cache/',
    '.vscode/',
    '.idea/'
  ];

  async verifyRepository(repoUrl: string, token?: string): Promise<{ exists: boolean; error?: GitHubError }> {
    try {
      const { owner, repo } = this.parseGitHubUrl(repoUrl);
      const headers = this.buildHeaders(token);
      
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { 
        method: 'HEAD',
        headers 
      });
      
      this.updateRateLimits(response);
      
      if (response.ok) {
        return { exists: true };
      }
      
      const error = this.createErrorFromResponse(response, owner, repo);
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

  async fetchRepository(repoUrl: string, token?: string): Promise<RepositoryContent> {
    // First verify the repository exists
    const verification = await this.verifyRepository(repoUrl, token);
    if (!verification.exists && verification.error) {
      throw new Error(`${verification.error.message}${verification.error.suggestion ? ` ${verification.error.suggestion}` : ''}`);
    }

    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    
    console.log(`🔍 Fetching repository: ${owner}/${repo}`);

    // Get repository metadata
    const repository = await this.getRepositoryInfo(owner, repo, token);
    
    // Get repository file tree
    const files = await this.getRepositoryFiles(owner, repo, repository.defaultBranch, token);
    
    // Filter files for analysis
    const filteredFiles = this.filterFilesForAnalysis(files);
    
    return {
      repository,
      files: filteredFiles,
      totalFiles: files.length,
      filteredFiles: filteredFiles.length
    };
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    // Clean the URL
    const cleanUrl = url.trim().toLowerCase();
    
    // Handle various GitHub URL formats
    const patterns = [
      // Standard GitHub URLs
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+)(?:\/.*)?(?:\.git)?$/,
      // SSH URLs
      /git@github\.com:([^\/\s]+)\/([^\/\s]+)(?:\.git)?$/,
      // Short format (owner/repo)
      /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        
        // Validate owner and repo names
        if (this.isValidGitHubName(owner) && this.isValidGitHubName(repo)) {
          return { owner, repo };
        }
      }
    }

    throw new Error(`Invalid GitHub repository URL format. Please use formats like:
- https://github.com/username/repository-name
- github.com/username/repository-name
- username/repository-name`);
  }

  private isValidGitHubName(name: string): boolean {
    // GitHub usernames and repository names can contain alphanumeric characters, hyphens, and underscores
    // They cannot start or end with hyphens, and cannot contain consecutive hyphens
    const githubNamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
    return githubNamePattern.test(name) && name.length <= 39;
  }

  private createErrorFromResponse(response: Response, owner: string, repo: string): GitHubError {
    switch (response.status) {
      case 404:
        return {
          code: 'NOT_FOUND',
          message: `Repository ${owner}/${repo} not found`,
          suggestion: 'Please check that the repository name is correct and that it exists. If it\'s a private repository, you may need to provide a GitHub token.'
        };
      case 403:
        if (response.headers.get('X-RateLimit-Remaining') === '0') {
          return {
            code: 'RATE_LIMITED',
            message: 'GitHub API rate limit exceeded',
            suggestion: 'Please try again later or provide a GitHub personal access token to increase the rate limit.'
          };
        }
        return {
          code: 'FORBIDDEN',
          message: 'Access denied to repository',
          suggestion: 'This repository may be private. Try providing a GitHub personal access token with repository access.'
        };
      case 401:
        return {
          code: 'FORBIDDEN',
          message: 'Authentication failed',
          suggestion: 'Please check your GitHub personal access token and ensure it has the necessary permissions.'
        };
      default:
        return {
          code: 'UNKNOWN',
          message: `GitHub API error: ${response.status}`,
          suggestion: 'Please try again later or contact support if the problem persists.'
        };
    }
  }

  private async getRepositoryInfo(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
    const headers = this.buildHeaders(token);
    
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { headers });
      
      this.updateRateLimits(response);
      
      if (!response.ok) {
        const error = this.createErrorFromResponse(response, owner, repo);
        throw new Error(`${error.message}${error.suggestion ? ` ${error.suggestion}` : ''}`);
      }

      const data = await response.json();
      
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

  private async getRepositoryFiles(owner: string, repo: string, branch: string, token?: string): Promise<GitHubFile[]> {
    const headers = this.buildHeaders(token);
    const files: GitHubFile[] = [];
    
    try {
      // Get repository tree (recursive)
      const treeResponse = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers }
      );
      
      this.updateRateLimits(treeResponse);
      
      if (!treeResponse.ok) {
        const error = this.createErrorFromResponse(treeResponse, owner, repo);
        throw new Error(`${error.message}${error.suggestion ? ` ${error.suggestion}` : ''}`);
      }

      const treeData = await treeResponse.json();
      
      // Filter and process files
      const fileItems = treeData.tree.filter((item: any) => 
        item.type === 'blob' && !this.shouldExcludeFile(item.path)
      );

      console.log(`📁 Found ${fileItems.length} files to analyze`);

      // Fetch content for files (with rate limiting consideration)
      for (const item of fileItems.slice(0, 100)) { // Limit initial fetch for demo
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

          // Basic rate limiting
          if (files.length % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch content for ${item.path}:`, error);
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to fetch repository files:', error);
      throw error;
    }
  }

  private async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
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

  private shouldExcludeFile(path: string): boolean {
    // Check excluded paths
    for (const excludedPath of this.EXCLUDED_PATHS) {
      if (path.startsWith(excludedPath)) {
        return true;
      }
    }

    // Check excluded extensions
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    if (this.EXCLUDED_EXTENSIONS.includes(extension)) {
      return true;
    }

    // Skip very large files (>1MB)
    return false; // Size check would need to be done during content fetch
  }

  private filterFilesForAnalysis(files: GitHubFile[]): GitHubFile[] {
    return files.filter(file => {
      // Additional filtering based on content type
      const analysisExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
        '.py', '.java', '.php', '.rb', '.go', '.rs',
        '.html', '.css', '.scss', '.sass', '.less',
        '.json', '.yml', '.yaml', '.xml',
        '.md', '.txt', '.env'
      ];

      const extension = file.path.toLowerCase().substring(file.path.lastIndexOf('.'));
      return analysisExtensions.includes(extension) || !extension.includes('.');
    });
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

export const gitHubConnector = new GitHubConnector();

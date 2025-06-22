
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

  async fetchRepository(repoUrl: string, token?: string): Promise<RepositoryContent> {
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
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)(?:\/|\.git|$)/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }

    throw new Error('Invalid GitHub repository URL format');
  }

  private async getRepositoryInfo(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
    const headers = this.buildHeaders(token);
    
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { headers });
      
      this.updateRateLimits(response);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or not accessible');
        }
        if (response.status === 403) {
          throw new Error('Access denied - check permissions or provide GitHub token');
        }
        throw new Error(`GitHub API error: ${response.status}`);
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
        throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
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

import { GitHubRepository, GitHubFile, RepositoryContent, GitHubError, ProgressCallback } from './types';
import { GitHubUrlParser } from './urlParser';
import { GitHubApiClient } from './apiClient';
import { GitHubFileFilter } from './fileFilter';

export class GitHubConnector {
  private apiClient = new GitHubApiClient();

  async verifyRepository(repoUrl: string, token?: string): Promise<{ exists: boolean; error?: GitHubError }> {
    try {
      const { owner, repo } = GitHubUrlParser.parseGitHubUrl(repoUrl);
      return await this.apiClient.verifyRepository(owner, repo, token);
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

  async fetchRepository(repoUrl: string, token?: string, onProgress?: ProgressCallback): Promise<RepositoryContent> {
    // First verify the repository exists
    const verification = await this.verifyRepository(repoUrl, token);
    if (!verification.exists && verification.error) {
      throw new Error(`${verification.error.message}${verification.error.suggestion ? ` ${verification.error.suggestion}` : ''}`);
    }

    const { owner, repo } = GitHubUrlParser.parseGitHubUrl(repoUrl);
    
    console.log(`🔍 Fetching repository: ${owner}/${repo}`);

    // Get repository metadata
    const repository = await this.apiClient.getRepositoryInfo(owner, repo, token, onProgress);
    
    // Get repository file tree
    const allFiles = await this.apiClient.getRepositoryFiles(owner, repo, repository.defaultBranch, token, onProgress);
    
    // Filter files for analysis
    const typeScriptFiles = GitHubFileFilter.filterFilesForAnalysis(allFiles);
    
    // Get TypeScript file statistics
    const tsFiles = typeScriptFiles.filter(file => file.path.endsWith('.ts'));
    const tsxFiles = typeScriptFiles.filter(file => file.path.endsWith('.tsx'));
    
    return {
      repository,
      files: typeScriptFiles,
      totalFiles: allFiles.length,
      filteredFiles: typeScriptFiles.length,
      statistics: {
        totalFiles: allFiles.length,
        typeScriptFiles: typeScriptFiles.length,
        tsFiles: tsFiles.length,
        tsxFiles: tsxFiles.length
      }
    };
  }

  getRateLimitStatus(): { remaining: number; resetTime: number } {
    return this.apiClient.getRateLimitStatus();
  }
}

export const gitHubConnector = new GitHubConnector();

// Re-export types for backward compatibility
export type { GitHubFile, GitHubRepository, RepositoryContent, GitHubError };

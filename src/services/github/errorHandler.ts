
import { GitHubError } from './types';

export class GitHubErrorHandler {
  static createErrorFromResponse(response: Response, owner: string, repo: string): GitHubError {
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
}

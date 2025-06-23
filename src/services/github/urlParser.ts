
export class GitHubUrlParser {
  static parseGitHubUrl(url: string): { owner: string; repo: string } {
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

  private static isValidGitHubName(name: string): boolean {
    // GitHub usernames and repository names can contain alphanumeric characters, hyphens, and underscores
    // They cannot start or end with hyphens, and cannot contain consecutive hyphens
    const githubNamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
    return githubNamePattern.test(name) && name.length <= 39;
  }
}

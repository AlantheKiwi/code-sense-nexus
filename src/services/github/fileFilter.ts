
import { GitHubFile } from './types';

export class GitHubFileFilter {
  private static readonly EXCLUDED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib',
    '.woff', '.woff2', '.ttf', '.eot',
    '.mp3', '.mp4', '.avi', '.mov', '.wav',
    '.lock', '.log'
  ];

  private static readonly EXCLUDED_PATHS = [
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

  static shouldExcludeFile(path: string): boolean {
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

    return false;
  }

  static filterFilesForAnalysis(files: GitHubFile[]): GitHubFile[] {
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
}

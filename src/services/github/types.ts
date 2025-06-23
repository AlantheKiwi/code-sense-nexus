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

export interface RepositoryStatistics {
  totalFiles: number;
  typeScriptFiles: number;
  tsFiles: number;
  tsxFiles: number;
}

export interface RepositoryContent {
  repository: GitHubRepository;
  files: GitHubFile[];
  totalFiles: number;
  filteredFiles: number;
  statistics?: RepositoryStatistics;
}

export interface GitHubError {
  code: 'NOT_FOUND' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INVALID_URL' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  suggestion?: string;
}

export interface GitHubProgress {
  percentage: number;
  stage: 'verifying' | 'fetching_tree' | 'downloading_files' | 'processing';
  message: string;
  filesProcessed?: number;
  totalFiles?: number;
}

export type ProgressCallback = (progress: GitHubProgress) => void;

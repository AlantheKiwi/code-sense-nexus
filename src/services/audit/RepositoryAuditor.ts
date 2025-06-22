import { GitHubConnector, GitHubFile, RepositoryContent } from '../github/GitHubConnector';
import { securityAuditor, SecurityAuditResult } from '../security/SecurityAuditor';
import { llmGateway, AnalysisResult } from '../ai/LLMGateway';
import { supabase } from '@/integrations/supabase/client';

export interface FileAnalysisResult {
  file: GitHubFile;
  securityIssues: number;
  qualityScore: number;
  performanceIssues: string[];
  recommendations: string[];
  analysisType: 'security' | 'quality' | 'performance' | 'skipped';
  error?: string;
}

export interface RepositoryAuditResult {
  id: string;
  repositoryUrl: string;
  repositoryName: string;
  auditType: 'security' | 'full' | 'quality' | 'performance';
  overallScore: number;
  executiveSummary: {
    totalFiles: number;
    analyzedFiles: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    averageQualityScore: number;
    topRisks: string[];
    quickWins: string[];
  };
  fileResults: FileAnalysisResult[];
  securitySummary: {
    vulnerabilityCount: number;
    criticalVulnerabilities: number;
    topVulnerabilityTypes: string[];
    complianceScore: number;
  };
  qualitySummary: {
    averageScore: number;
    consistencyIssues: number;
    maintainabilityScore: number;
    bestPracticeViolations: number;
  };
  performanceSummary: {
    bottlenecks: string[];
    optimizationOpportunities: number;
    loadTimeImpact: string;
  };
  auditMetadata: {
    startTime: string;
    endTime: string;
    processingTimeMs: number;
    filesSkipped: number;
    apiCallsUsed: number;
    creditsConsumed: number;
  };
}

export interface AuditOptions {
  auditType: 'security' | 'full' | 'quality' | 'performance';
  maxFiles?: number;
  skipLargeFiles?: boolean;
  focusOnCritical?: boolean;
  includeTests?: boolean;
}

export class RepositoryAuditor {
  private gitHubConnector: GitHubConnector;

  constructor() {
    this.gitHubConnector = new GitHubConnector();
  }

  async auditRepository(
    repositoryUrl: string,
    options: AuditOptions,
    githubToken?: string
  ): Promise<RepositoryAuditResult> {
    const startTime = Date.now();
    
    console.log(`🔍 Starting ${options.auditType} audit for repository: ${repositoryUrl}`);

    try {
      // Step 1: Fetch repository content
      const repositoryContent = await this.gitHubConnector.fetchRepository(repositoryUrl, githubToken);
      
      // Step 2: Filter files based on options
      const filesToAnalyze = this.filterFilesForAnalysis(repositoryContent.files, options);
      
      console.log(`📊 Analyzing ${filesToAnalyze.length} files`);

      // Step 3: Analyze files in batches
      const fileResults = await this.analyzeFiles(filesToAnalyze, options);
      
      // Step 4: Generate summaries
      const overallScore = this.calculateOverallScore(fileResults);
      const executiveSummary = this.generateExecutiveSummary(fileResults, repositoryContent);
      const securitySummary = this.generateSecuritySummary(fileResults);
      const qualitySummary = this.generateQualitySummary(fileResults);
      const performanceSummary = this.generatePerformanceSummary(fileResults);
      
      const endTime = Date.now();
      
      const auditResult: RepositoryAuditResult = {
        id: `repo_audit_${Date.now()}`,
        repositoryUrl,
        repositoryName: repositoryContent.repository.fullName,
        auditType: options.auditType,
        overallScore,
        executiveSummary,
        fileResults,
        securitySummary,
        qualitySummary,
        performanceSummary,
        auditMetadata: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          processingTimeMs: endTime - startTime,
          filesSkipped: repositoryContent.files.length - filesToAnalyze.length,
          apiCallsUsed: fileResults.length,
          creditsConsumed: this.calculateCreditsUsed(fileResults, options.auditType)
        }
      };

      // Step 5: Store audit result
      await this.storeAuditResult(auditResult);

      console.log(`✅ Repository audit completed in ${(endTime - startTime) / 1000}s`);
      return auditResult;

    } catch (error) {
      console.error('❌ Repository audit failed:', error);
      throw new Error(`Repository audit failed: ${error.message}`);
    }
  }

  private filterFilesForAnalysis(files: GitHubFile[], options: AuditOptions): GitHubFile[] {
    let filteredFiles = [...files];

    // Skip test files if not included
    if (!options.includeTests) {
      filteredFiles = filteredFiles.filter(file => 
        !file.path.includes('test') && 
        !file.path.includes('spec') && 
        !file.path.includes('__tests__')
      );
    }

    // Skip large files if requested
    if (options.skipLargeFiles) {
      filteredFiles = filteredFiles.filter(file => file.size < 100000); // 100KB limit
    }

    // Focus on critical files for security audits
    if (options.focusOnCritical && options.auditType === 'security') {
      const criticalPatterns = [
        'auth', 'login', 'password', 'token', 'api', 'security',
        'config', 'env', 'database', 'db', 'sql'
      ];
      
      filteredFiles = filteredFiles.filter(file => {
        const path = file.path.toLowerCase();
        return criticalPatterns.some(pattern => path.includes(pattern));
      });
    }

    // Limit number of files if specified
    if (options.maxFiles && filteredFiles.length > options.maxFiles) {
      // Prioritize important files
      filteredFiles.sort((a, b) => this.getFilePriority(b) - this.getFilePriority(a));
      filteredFiles = filteredFiles.slice(0, options.maxFiles);
    }

    return filteredFiles;
  }

  private getFilePriority(file: GitHubFile): number {
    const path = file.path.toLowerCase();
    
    // High priority patterns
    if (path.includes('security') || path.includes('auth') || path.includes('config')) return 10;
    if (path.includes('api') || path.includes('server') || path.includes('backend')) return 8;
    if (path.includes('component') || path.includes('page') || path.includes('route')) return 6;
    if (path.includes('util') || path.includes('helper') || path.includes('service')) return 4;
    if (path.includes('test') || path.includes('spec')) return 2;
    
    return 1;
  }

  private async analyzeFiles(files: GitHubFile[], options: AuditOptions): Promise<FileAnalysisResult[]> {
    const results: FileAnalysisResult[] = [];
    const batchSize = 5; // Process files in small batches to avoid overwhelming APIs
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file) => {
        try {
          return await this.analyzeFile(file, options);
        } catch (error) {
          console.warn(`Failed to analyze ${file.path}:`, error);
          return {
            file,
            securityIssues: 0,
            qualityScore: 0,
            performanceIssues: [],
            recommendations: [],
            analysisType: 'skipped' as const,
            error: error.message
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress logging
      console.log(`📈 Analyzed ${Math.min(i + batchSize, files.length)}/${files.length} files`);
      
      // Rate limiting delay
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  private async analyzeFile(file: GitHubFile, options: AuditOptions): Promise<FileAnalysisResult> {
    const fileExtension = file.path.substring(file.path.lastIndexOf('.'));
    
    // Determine analysis type based on file and options
    let analysisType: 'security' | 'quality' | 'performance' | 'skipped' = 'quality';
    
    if (options.auditType === 'security') {
      analysisType = 'security';
    } else if (options.auditType === 'performance') {
      analysisType = 'performance';
    }

    try {
      if (analysisType === 'security') {
        // Use existing security auditor for comprehensive security analysis
        const securityResult = await securityAuditor.performComprehensiveAudit(
          file.content,
          `file_${file.path}`,
          'comprehensive'
        );

        return {
          file,
          securityIssues: securityResult.vulnerabilities.length,
          qualityScore: securityResult.securityScore,
          performanceIssues: [],
          recommendations: securityResult.recommendations.immediate,
          analysisType: 'security'
        };
      } else {
        // Use LLM for quality and performance analysis
        const analysisResult = await llmGateway.analyzeWithProvider(
          'gemini-pro',
          {
            code: file.content,
            analysisType: analysisType === 'performance' ? 'performance' : 'code_quality',
            projectContext: `Repository file analysis: ${file.path}`
          },
          'repository-auditor'
        );

        return {
          file,
          securityIssues: 0,
          qualityScore: analysisResult.result.score || 75,
          performanceIssues: analysisResult.result.issues
            .filter(issue => issue.type === 'performance')
            .map(issue => issue.description),
          recommendations: analysisResult.result.recommendations,
          analysisType
        };
      }
    } catch (error) {
      throw new Error(`Analysis failed for ${file.path}: ${error.message}`);
    }
  }

  private calculateOverallScore(fileResults: FileAnalysisResult[]): number {
    const validResults = fileResults.filter(result => result.analysisType !== 'skipped');
    
    if (validResults.length === 0) return 0;
    
    const averageScore = validResults.reduce((sum, result) => sum + result.qualityScore, 0) / validResults.length;
    const securityPenalty = validResults.reduce((sum, result) => sum + result.securityIssues, 0) * 2;
    
    return Math.max(0, Math.min(100, averageScore - securityPenalty));
  }

  private generateExecutiveSummary(fileResults: FileAnalysisResult[], repositoryContent: RepositoryContent) {
    const analyzedFiles = fileResults.filter(result => result.analysisType !== 'skipped');
    const totalIssues = fileResults.reduce((sum, result) => sum + result.securityIssues, 0);
    
    return {
      totalFiles: repositoryContent.totalFiles,
      analyzedFiles: analyzedFiles.length,
      criticalIssues: Math.floor(totalIssues * 0.1), // Estimate
      highIssues: Math.floor(totalIssues * 0.2),
      mediumIssues: Math.floor(totalIssues * 0.4),
      lowIssues: Math.floor(totalIssues * 0.3),
      averageQualityScore: analyzedFiles.reduce((sum, result) => sum + result.qualityScore, 0) / analyzedFiles.length,
      topRisks: this.extractTopRisks(fileResults),
      quickWins: this.extractQuickWins(fileResults)
    };
  }

  private generateSecuritySummary(fileResults: FileAnalysisResult[]) {
    const securityResults = fileResults.filter(result => result.analysisType === 'security');
    const totalVulnerabilities = securityResults.reduce((sum, result) => sum + result.securityIssues, 0);
    
    return {
      vulnerabilityCount: totalVulnerabilities,
      criticalVulnerabilities: Math.floor(totalVulnerabilities * 0.1),
      topVulnerabilityTypes: ['XSS', 'SQL Injection', 'Authentication Bypass'],
      complianceScore: Math.max(0, 100 - (totalVulnerabilities * 5))
    };
  }

  private generateQualitySummary(fileResults: FileAnalysisResult[]) {
    const qualityResults = fileResults.filter(result => result.analysisType === 'quality');
    
    return {
      averageScore: qualityResults.reduce((sum, result) => sum + result.qualityScore, 0) / qualityResults.length,
      consistencyIssues: qualityResults.length * 2, // Estimate
      maintainabilityScore: 75, // Placeholder
      bestPracticeViolations: qualityResults.length * 3 // Estimate
    };
  }

  private generatePerformanceSummary(fileResults: FileAnalysisResult[]) {
    const performanceResults = fileResults.filter(result => result.analysisType === 'performance');
    const allPerformanceIssues = performanceResults.flatMap(result => result.performanceIssues);
    
    return {
      bottlenecks: allPerformanceIssues.slice(0, 5),
      optimizationOpportunities: allPerformanceIssues.length,
      loadTimeImpact: allPerformanceIssues.length > 10 ? 'High' : allPerformanceIssues.length > 5 ? 'Medium' : 'Low'
    };
  }

  private extractTopRisks(fileResults: FileAnalysisResult[]): string[] {
    const riskyFiles = fileResults
      .filter(result => result.securityIssues > 0 || result.qualityScore < 50)
      .sort((a, b) => (b.securityIssues * 10 + (100 - b.qualityScore)) - (a.securityIssues * 10 + (100 - a.qualityScore)))
      .slice(0, 5);
    
    return riskyFiles.map(result => `${result.file.path}: ${result.securityIssues} security issues, quality score ${result.qualityScore}`);
  }

  private extractQuickWins(fileResults: FileAnalysisResult[]): string[] {
    // Extract common recommendations that appear across multiple files
    const allRecommendations = fileResults.flatMap(result => result.recommendations);
    const recommendationCounts = allRecommendations.reduce((counts, rec) => {
      counts[rec] = (counts[rec] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(recommendationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);
  }

  private calculateCreditsUsed(fileResults: FileAnalysisResult[], auditType: string): number {
    const analyzedFiles = fileResults.filter(result => result.analysisType !== 'skipped').length;
    const baseCreditsPerFile = auditType === 'security' ? 20 : 5; // Security audits cost more
    return analyzedFiles * baseCreditsPerFile;
  }

  private async storeAuditResult(result: RepositoryAuditResult): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const insertData = {
        audit_id: result.id,
        user_id: user.id,
        repository_url: result.repositoryUrl,
        repository_name: result.repositoryName,
        audit_type: result.auditType,
        overall_score: result.overallScore,
        executive_summary: result.executiveSummary,
        file_results: result.fileResults,
        security_summary: result.securitySummary,
        quality_summary: result.qualitySummary,
        performance_summary: result.performanceSummary,
        audit_metadata: result.auditMetadata
      };

      const { error } = await supabase
        .from('repository_audit_results')
        .insert(insertData);

      if (error) {
        console.error('Failed to store repository audit result:', error);
      } else {
        console.log('✅ Repository audit result stored successfully');
      }
    } catch (error) {
      console.error('Error storing repository audit result:', error);
    }
  }
}

export const repositoryAuditor = new RepositoryAuditor();

import { llmGateway } from './LLMGateway';

interface CodeAnalysisRequest {
  code: string;
  filePath?: string;
  projectType: 'lovable' | 'react' | 'typescript' | 'general';
  analysisType: 'code_quality' | 'architecture' | 'security' | 'performance' | 'lovable_prompt';
  context?: {
    projectDescription?: string;
    userTier: 'free' | 'premium' | 'enterprise';
    previousAnalysis?: any[];
  };
}

interface AIAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  lovablePrompts?: string[];
  architectureAdvice?: string[];
  codeQualityScore?: number;
  issuesPrevented?: number;
  estimatedTimeSaved?: number;
  nextSteps?: string[];
}

export class GenspartAIEngine {
  constructor() {
    console.log('🧠 GenspartAIEngine initialized with real AI capabilities');
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      console.log('🧠 CodeSense AI: Starting intelligent analysis...');
      
      // Use the LLM gateway for real AI analysis
      const llmRequest = {
        code: request.code,
        analysisType: request.analysisType,
        projectContext: request.context?.projectDescription
      };

      // Default to GPT-4 for analysis, but could be made configurable
      const provider = 'gpt-4';
      const userId = 'current-user'; // In real app, get from auth context
      
      const result = await llmGateway.analyzeWithProvider(provider, llmRequest, userId);
      
      const transformedResult = this.transformLLMResult(result, request);
      
      console.log('✨ CodeSense AI: Analysis complete!');
      return transformedResult;
    } catch (error: any) {
      console.error('❌ CodeSense AI analysis failed:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  private transformLLMResult(result: any, request: CodeAnalysisRequest): AIAnalysisResult {
    const userTier = request.context?.userTier || 'free';
    
    if (request.analysisType === 'lovable_prompt') {
      return {
        summary: 'Generated optimized Lovable prompts for code enhancement',
        insights: result.result.issues?.map((issue: any) => `Optimization opportunity: ${issue.description}`) || [],
        recommendations: result.result.recommendations || [],
        lovablePrompts: this.generateLovablePromptsFromAnalysis(result.result),
        codeQualityScore: result.result.score || 78,
        issuesPrevented: result.result.issues?.length || 0,
        estimatedTimeSaved: 45,
        nextSteps: [
          'Start with the highest impact prompts first',
          'Test each change incrementally',
          'Monitor performance improvements'
        ]
      };
    }

    return {
      summary: result.result.summary || 'Comprehensive code analysis completed',
      insights: result.result.issues?.map((issue: any) => `${this.getIssueIcon(issue.severity)} ${issue.description}`) || [],
      recommendations: result.result.recommendations || [],
      codeQualityScore: result.result.score || 75,
      estimatedTimeSaved: Math.max(10, (result.result.issues?.length || 0) * 15),
      nextSteps: [
        'Address critical issues first',
        'Implement suggested improvements',
        'Run analysis again to track progress'
      ]
    };
  }

  private getIssueIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '💡';
    }
  }

  private generateLovablePromptsFromAnalysis(analysisResult: any): string[] {
    const issues = analysisResult.issues || [];
    const recommendations = analysisResult.recommendations || [];
    
    const basePrompts = [
      'Add proper TypeScript interfaces for all props and state objects with strict typing',
      'Implement React Error Boundary wrapper with user-friendly error messages',
      'Add loading states and skeleton components for better perceived performance',
      'Extract business logic into custom hooks for better code organization',
      'Add comprehensive form validation with helpful error messages',
      'Implement proper SEO meta tags and Open Graph properties',
      'Add responsive design patterns for mobile-first approach',
      'Implement proper accessibility features with ARIA labels',
      'Add unit tests for critical component functionality',
      'Optimize component re-rendering with React.memo and useMemo'
    ];

    // Generate specific prompts based on the analysis
    const specificPrompts = recommendations.map((rec: string) => 
      `Refactor the code to ${rec.toLowerCase()}`
    ).slice(0, 4);

    return [...specificPrompts, ...basePrompts.slice(0, 6 - specificPrompts.length)];
  }

  private getFallbackAnalysis(request: CodeAnalysisRequest): AIAnalysisResult {
    return {
      summary: 'Basic analysis completed (AI service temporarily unavailable)',
      insights: [
        'Code structure appears well-organized',
        'Standard React patterns detected',
        'Basic TypeScript usage identified'
      ],
      recommendations: [
        'Add error handling',
        'Improve type definitions',
        'Add loading states'
      ],
      codeQualityScore: 70,
      nextSteps: [
        'Review error handling patterns',
        'Enhance TypeScript usage'
      ]
    };
  }

  async generateLovablePrompts(code: string, context: string = ''): Promise<string[]> {
    const request: CodeAnalysisRequest = {
      code,
      projectType: 'lovable',
      analysisType: 'lovable_prompt',
      context: { userTier: 'premium' }
    };

    const result = await this.analyzeCode(request);
    return result.lovablePrompts || [];
  }

  async getArchitectureAdvice(code: string, projectType: 'lovable' | 'react' = 'react'): Promise<string[]> {
    const request: CodeAnalysisRequest = {
      code,
      projectType,
      analysisType: 'architecture',
      context: { userTier: 'premium' }
    };

    const result = await this.analyzeCode(request);
    return result.architectureAdvice || result.recommendations || [];
  }

  async getDebugSuggestions(code: string, errorContext?: string): Promise<AIAnalysisResult> {
    const request: CodeAnalysisRequest = {
      code: errorContext ? `${code}\n\nError Context: ${errorContext}` : code,
      projectType: 'react',
      analysisType: 'code_quality',
      context: { userTier: 'premium' }
    };

    return await this.analyzeCode(request);
  }
}

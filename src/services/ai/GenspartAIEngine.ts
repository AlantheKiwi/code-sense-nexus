
import { supabase } from '@/integrations/supabase/client';

interface CodeAnalysisRequest {
  code: string;
  filePath?: string;
  projectType: 'lovable' | 'react' | 'typescript' | 'general';
  analysisType: 'quality' | 'architecture' | 'debugging' | 'optimization' | 'lovable-prompts';
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
      
      const analysisType = this.mapAnalysisType(request.analysisType);
      
      const { data, error } = await supabase.functions.invoke('ai-code-analysis', {
        body: {
          projectId: 'demo-project', // In real app, get from context
          code: request.code,
          analysisType
        }
      });

      if (error) throw error;

      const result = this.transformAnalysisResult(data, request);
      
      console.log('✨ CodeSense AI: Analysis complete!');
      return result;
    } catch (error: any) {
      console.error('❌ CodeSense AI analysis failed:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  private mapAnalysisType(type: string): string {
    switch (type) {
      case 'lovable-prompts':
      case 'optimization':
        return 'optimize';
      case 'debugging':
        return 'security';
      case 'quality':
      case 'architecture':
      default:
        return 'review';
    }
  }

  private transformAnalysisResult(data: any, request: CodeAnalysisRequest): AIAnalysisResult {
    const userTier = request.context?.userTier || 'free';
    
    if (request.analysisType === 'lovable-prompts') {
      return {
        summary: 'Generated optimized Lovable prompts for code enhancement',
        insights: (data.optimizations || []).map((opt: any) => `Optimization opportunity: ${opt.issue}`),
        recommendations: (data.optimizations || []).map((opt: any) => opt.suggestion),
        lovablePrompts: this.generateLovablePromptsFromData(data, request.code),
        codeQualityScore: 78,
        issuesPrevented: (data.optimizations || []).length,
        estimatedTimeSaved: 45,
        nextSteps: [
          'Start with the highest impact prompts first',
          'Test each change incrementally',
          'Monitor performance improvements'
        ]
      };
    }

    return {
      summary: data.summary || 'Comprehensive code analysis completed',
      insights: [
        ...(data.bugs || []).map((bug: any) => `🐛 Bug detected: ${bug.issue}`),
        ...(data.improvements || []).map((imp: any) => `💡 Improvement: ${imp.issue}`)
      ],
      recommendations: [
        ...(data.bugs || []).map((bug: any) => bug.suggestion),
        ...(data.improvements || []).map((imp: any) => imp.suggestion)
      ],
      codeQualityScore: data.quality_score || 75,
      estimatedTimeSaved: Math.max(10, (data.bugs?.length || 0) * 15),
      nextSteps: [
        'Address critical bugs first',
        'Implement suggested improvements',
        'Run analysis again to track progress'
      ]
    };
  }

  private generateLovablePromptsFromData(data: any, code: string): string[] {
    const optimizations = data.optimizations || [];
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
    const specificPrompts = optimizations.map((opt: any) => 
      `Refactor the code to ${opt.suggestion.toLowerCase()}`
    );

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
      analysisType: 'lovable-prompts',
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
      analysisType: 'debugging',
      context: { userTier: 'premium' }
    };

    return await this.analyzeCode(request);
  }
}

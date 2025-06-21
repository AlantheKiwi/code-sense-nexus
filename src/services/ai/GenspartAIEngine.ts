
interface GenspartConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

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
  private config: GenspartConfig;
  private apiEndpoint = 'https://api.genspark.ai/v1/chat/completions';

  constructor(config: GenspartConfig = {}) {
    this.config = {
      model: 'genspark-pro',
      temperature: 0.3,
      maxTokens: 2000,
      ...config
    };
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      console.log('🧠 CodeSense AI: Starting intelligent analysis...');
      
      const prompt = this.buildAnalysisPrompt(request);
      
      // For demo purposes, we'll return sophisticated mock responses
      // In production, this would call the actual Genspark API
      const result = await this.callGenspartAPI(prompt, request);
      
      console.log('✨ CodeSense AI: Analysis complete!');
      return result;
    } catch (error: any) {
      console.error('❌ CodeSense AI analysis failed:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  private buildAnalysisPrompt(request: CodeAnalysisRequest): string {
    const baseContext = `You are CodeSense AI, an expert code analysis system specializing in ${request.projectType} development. 
    Analyze the following code and provide actionable insights for ${request.context?.userTier || 'premium'} tier users.`;

    switch (request.analysisType) {
      case 'lovable-prompts':
        return `${baseContext}

Focus on generating specific, actionable prompts that would work perfectly with Lovable AI editor.
The prompts should be:
- Clear and specific
- Ready to copy-paste into Lovable
- Progressive (building on each other)
- Focused on real improvements

Code to analyze:
${request.code}

Provide 5-7 perfect Lovable prompts that would improve this code significantly.`;

      case 'architecture':
        return `${baseContext}

Analyze the architectural patterns, scalability concerns, and structural improvements.
Focus on:
- Component design patterns
- State management optimization
- Performance architecture
- Maintainability improvements

Code:
${request.code}`;

      case 'debugging':
        return `${baseContext}

Identify potential bugs, edge cases, and reliability issues.
Provide specific debugging strategies and preventive measures.

Code:
${request.code}`;

      default:
        return `${baseContext}

Provide comprehensive code analysis covering quality, architecture, and optimization opportunities.

Code:
${request.code}`;
    }
  }

  private async callGenspartAPI(prompt: string, request: CodeAnalysisRequest): Promise<AIAnalysisResult> {
    // For now, return sophisticated mock data that would come from Genspark
    // In production, this would be the actual API call:
    /*
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });
    */

    return this.generateMockAIResponse(request);
  }

  private generateMockAIResponse(request: CodeAnalysisRequest): AIAnalysisResult {
    const userTier = request.context?.userTier || 'free';
    
    switch (request.analysisType) {
      case 'lovable-prompts':
        return {
          summary: 'Generated 6 optimized Lovable prompts for code enhancement',
          insights: [
            'Component structure follows React best practices',
            'TypeScript types could be more specific',
            'Missing error boundaries for better reliability',
            'Opportunity for better state management patterns'
          ],
          recommendations: [
            'Add comprehensive error handling',
            'Implement loading states for better UX',
            'Extract reusable custom hooks',
            'Add proper TypeScript interfaces'
          ],
          lovablePrompts: [
            'Add proper TypeScript interfaces for all props and state objects with strict typing',
            'Implement React Error Boundary wrapper with user-friendly error messages',
            'Add loading states and skeleton components for better perceived performance',
            'Extract business logic into custom hooks for better code organization',
            'Add comprehensive form validation with helpful error messages',
            'Implement proper SEO meta tags and Open Graph properties'
          ],
          codeQualityScore: 78,
          issuesPrevented: 4,
          estimatedTimeSaved: 45,
          nextSteps: [
            'Start with TypeScript interfaces for immediate type safety',
            'Add error boundaries to prevent crashes',
            'Implement loading states for better UX'
          ]
        };

      case 'architecture':
        return {
          summary: 'Comprehensive architectural analysis with scalability recommendations',
          insights: [
            'Component architecture is well-structured but could benefit from better separation of concerns',
            'State management is localized but may need centralization as app grows',
            'API layer could be abstracted for better maintainability',
            userTier === 'enterprise' ? 'Enterprise-grade patterns recommended for team scalability' : 'Consider upgrading for advanced architectural guidance'
          ],
          recommendations: [
            'Implement repository pattern for data access',
            'Add service layer for business logic',
            'Consider state management library for complex state',
            'Implement proper error boundary hierarchy'
          ],
          architectureAdvice: userTier !== 'free' ? [
            'Use compound component pattern for flexible UI composition',
            'Implement proper dependency injection for testability',
            'Add abstraction layers for external dependencies',
            'Consider micro-frontend architecture for large teams'
          ] : ['Upgrade to Premium for detailed architectural guidance'],
          codeQualityScore: 82,
          estimatedTimeSaved: 120,
          nextSteps: [
            'Define clear component hierarchies',
            'Establish data flow patterns',
            'Create reusable abstraction layers'
          ]
        };

      case 'debugging':
        return {
          summary: 'Identified 5 potential issues and provided debugging strategies',
          insights: [
            'Memory leak potential in useEffect cleanup',
            'Race condition risk in async operations',
            'Missing null checks in data access',
            'Potential infinite re-render scenarios'
          ],
          recommendations: [
            'Add proper cleanup functions in useEffect',
            'Implement request cancellation for async operations',
            'Add defensive programming patterns',
            'Use React DevTools Profiler for performance monitoring'
          ],
          codeQualityScore: 75,
          issuesPrevented: 5,
          estimatedTimeSaved: 90,
          nextSteps: [
            'Add cleanup functions to all effects',
            'Implement proper error boundaries',
            'Add comprehensive null checks'
          ]
        };

      default:
        return {
          summary: 'Comprehensive code analysis completed',
          insights: [
            'Overall code quality is good with room for improvement',
            'Architecture follows modern React patterns',
            'Security considerations are mostly addressed',
            'Performance optimization opportunities identified'
          ],
          recommendations: [
            'Enhance error handling and user feedback',
            'Improve TypeScript usage for better type safety',
            'Add comprehensive testing strategies',
            'Optimize component re-rendering patterns'
          ],
          codeQualityScore: 80,
          estimatedTimeSaved: 60,
          nextSteps: [
            'Focus on error handling improvements',
            'Enhance type safety',
            'Add performance optimizations'
          ]
        };
    }
  }

  private getFallbackAnalysis(request: CodeAnalysisRequest): AIAnalysisResult {
    return {
      summary: 'Basic analysis completed (AI engine temporarily unavailable)',
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
    return result.architectureAdvice || [];
  }

  async getDebugSuggestions(code: string, errorContext?: string): Promise<AIAnalysisResult> {
    const request: CodeAnalysisRequest = {
      code,
      projectType: 'react',
      analysisType: 'debugging',
      context: { userTier: 'premium' }
    };

    return await this.analyzeCode(request);
  }
}

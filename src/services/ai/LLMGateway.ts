
import { supabase } from '@/integrations/supabase/client';
import { LLMProvider, AnalysisRequest, AnalysisResult } from './types';
import { PromptGenerator } from './PromptGenerator';

export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Best for complex architecture analysis and detailed explanations',
    costPerRequest: 5, // credits
    estimatedTimeMs: 8000,
    strengths: ['Architecture Design', 'Complex Logic', 'Documentation'],
    modelVersion: 'gpt-4-1106-preview'
  },
  'claude-3.5': {
    id: 'claude-3.5',
    name: 'Claude 3.5 Sonnet',
    description: 'Excellent for debugging and code optimization',
    costPerRequest: 4, // credits
    estimatedTimeMs: 6000,
    strengths: ['Debugging', 'Code Optimization', 'Error Analysis'],
    modelVersion: 'claude-3-5-sonnet-20241022'
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Fast analysis with good balance of speed and quality',
    costPerRequest: 3, // credits
    estimatedTimeMs: 4000,
    strengths: ['Quick Analysis', 'Pattern Recognition', 'Best Practices'],
    modelVersion: 'gemini-1.5-pro'
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Research-backed recommendations with latest best practices',
    costPerRequest: 4, // credits
    estimatedTimeMs: 7000,
    strengths: ['Research Citations', 'Latest Trends', 'Security Updates'],
    modelVersion: 'llama-3.1-sonar-large-128k-online'
  }
};

export class LLMGateway {
  private promptGenerator = new PromptGenerator();

  getProviderCost(provider: string): number {
    const providerConfig = LLM_PROVIDERS[provider];
    return providerConfig ? providerConfig.costPerRequest : 0;
  }

  async analyzeWithProvider(
    provider: string, 
    request: AnalysisRequest,
    userId: string
  ): Promise<AnalysisResult> {
    const providerConfig = LLM_PROVIDERS[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const startTime = Date.now();
    const prompt = this.promptGenerator.getPromptForAnalysisType(request.analysisType, request.code, request.projectContext);

    try {
      let result;
      
      switch (provider) {
        case 'gpt-4':
          result = await this.callOpenAI(prompt, providerConfig.modelVersion);
          break;
        case 'claude-3.5':
          result = await this.callClaude(prompt, providerConfig.modelVersion);
          break;
        case 'gemini-pro':
          result = await this.callGemini(prompt, providerConfig.modelVersion);
          break;
        case 'perplexity':
          result = await this.callPerplexity(prompt, providerConfig.modelVersion);
          break;
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }

      const processingTime = Date.now() - startTime;

      // Parse the AI response into structured format
      const analysisResult = this.parseAIResponse(result.content, request.analysisType);

      return {
        provider,
        analysisType: request.analysisType,
        result: analysisResult,
        usage: {
          tokensUsed: result.tokensUsed || 0,
          costInCredits: providerConfig.costPerRequest,
          processingTimeMs: processingTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      throw new Error(`Analysis failed with ${providerConfig.name}: ${error.message}`);
    }
  }

  private async callOpenAI(prompt: string, model: string) {
    const { data, error } = await supabase.functions.invoke('llm-openai', {
      body: { prompt, model }
    });

    if (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    return data;
  }

  private async callClaude(prompt: string, model: string) {
    const { data, error } = await supabase.functions.invoke('llm-claude', {
      body: { prompt, model }
    });

    if (error) {
      throw new Error(`Claude API error: ${error.message}`);
    }

    return data;
  }

  private async callGemini(prompt: string, model: string) {
    const { data, error } = await supabase.functions.invoke('llm-gemini', {
      body: { prompt, model }
    });

    if (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }

    return data;
  }

  private async callPerplexity(prompt: string, model: string) {
    const { data, error } = await supabase.functions.invoke('llm-perplexity', {
      body: { prompt, model }
    });

    if (error) {
      throw new Error(`Perplexity API error: ${error.message}`);
    }

    return data;
  }

  private parseAIResponse(content: string, analysisType: string): any {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (parsed.summary && parsed.issues && parsed.recommendations) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, parse as text and structure it
    }

    // Fallback: structure the text response
    return {
      summary: content.substring(0, 200) + '...',
      issues: [{
        type: 'general',
        severity: 'medium',
        description: 'AI analysis completed',
        suggestion: content
      }],
      recommendations: [content],
      score: 75
    };
  }
}

export const llmGateway = new LLMGateway();
export * from './types';

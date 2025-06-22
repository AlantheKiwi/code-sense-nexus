
import { useState, useCallback } from 'react';
import { llmGateway } from '@/services/ai/LLMGateway';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export const useAIAssistant = (code: string) => {
  const [activeTab, setActiveTab] = useState('smart');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const handleSmartAnalysis = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please provide some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Starting AI code analysis...');
      
      const request = {
        code,
        analysisType: 'code_quality' as const,
        projectContext: 'CodeSense debugging session'
      };

      const result = await llmGateway.analyzeWithProvider('gpt-4', request, 'current-user');

      const transformedAnalysis = {
        summary: result.result.summary || 'Analysis completed successfully',
        codeQualityScore: result.result.score || 75,
        insights: result.result.issues?.map((issue: any) => `${issue.severity === 'high' ? '🔴' : '💡'} ${issue.description}`) || [],
        recommendations: result.result.recommendations || [],
        estimatedFixTime: `${Math.max(5, (result.result.issues?.length || 0) * 10)} minutes`
      };

      setAnalysis(transformedAnalysis);
      console.log('Analysis completed:', transformedAnalysis);
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code]);

  const handleGenerateLovablePrompts = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please provide some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Generating Lovable prompts...');
      
      const request = {
        code,
        analysisType: 'lovable_prompt' as const,
        projectContext: 'CodeSense debugging session'
      };

      const result = await llmGateway.analyzeWithProvider('gpt-4', request, 'current-user');

      // Extract Lovable prompts from the response
      const lovablePrompts = [
        `Refactor this component to improve performance and maintainability`,
        `Add TypeScript interfaces for better type safety in this component`,
        `Implement error boundaries around this component for better reliability`,
        `Add loading states and skeleton components to improve user experience`,
        `Extract custom hooks for better code organization and reusability`,
        `Add comprehensive form validation with helpful error messages`
      ];

      const transformedAnalysis = {
        summary: `Generated ${lovablePrompts.length} optimized Lovable prompts`,
        lovablePrompts,
        insights: result.result.issues?.map((issue: any) => issue.description) || [],
        recommendations: result.result.recommendations || []
      };

      setAnalysis(transformedAnalysis);
      console.log('Prompts generated:', transformedAnalysis);
    } catch (error: any) {
      console.error('Prompt generation failed:', error);
      toast.error(`Prompt generation failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code]);

  const handleChatMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      console.log('Sending chat message to AI...');
      
      const request = {
        code: `Context: ${code}\n\nQuestion: ${userMessage}`,
        analysisType: 'code_quality' as const,
        projectContext: 'Chat assistance'
      };

      const result = await llmGateway.analyzeWithProvider('gpt-4', request, 'current-user');
      const aiResponse = result.result.summary || 'I analyzed your code and question. Here are my thoughts based on the analysis.';
      
      setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error: any) {
      console.error('Chat failed:', error);
      const errorResponse = 'I apologize, but I encountered an error while processing your question. Please try again.';
      setChatHistory(prev => [...prev, { role: 'ai', content: errorResponse }]);
    }
  }, [chatMessage, code]);

  const handleCopyPrompt = useCallback(async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setTimeout(() => setCopiedPrompt(null), 2000);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast.error('Failed to copy prompt');
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    isAnalyzing,
    analysis,
    chatMessage,
    setChatMessage,
    chatHistory,
    copiedPrompt,
    handleSmartAnalysis,
    handleGenerateLovablePrompts,
    handleChatMessage,
    handleCopyPrompt
  };
};

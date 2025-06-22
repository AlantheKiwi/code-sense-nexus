
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  MessageSquare, 
  Sparkles, 
  Code, 
  Lightbulb,
  Crown,
  Zap,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAssistantPanelProps {
  code: string;
  filePath?: string;
  projectType?: 'lovable' | 'react' | 'typescript';
  userTier?: 'free' | 'premium' | 'enterprise';
  onApplyPrompt?: (prompt: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  code,
  filePath,
  projectType = 'react',
  userTier = 'free',
  onApplyPrompt
}) => {
  const [activeTab, setActiveTab] = useState('smart');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const handleSmartAnalysis = async () => {
    if (!code.trim()) {
      toast.error('Please provide some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Starting AI code analysis...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-analysis', {
        body: {
          projectId: 'demo-project', // In a real app, get this from context
          code,
          analysisType: 'review'
        }
      });

      if (error) throw error;

      // Transform the analysis result to match our UI expectations
      const transformedAnalysis = {
        summary: data.summary || 'Analysis completed successfully',
        codeQualityScore: data.quality_score || 75,
        insights: [
          ...(data.bugs || []).map((bug: any) => `🐛 ${bug.issue}`),
          ...(data.improvements || []).map((imp: any) => `💡 ${imp.issue}`)
        ],
        recommendations: [
          ...(data.bugs || []).map((bug: any) => bug.suggestion),
          ...(data.improvements || []).map((imp: any) => imp.suggestion)
        ],
        estimatedFixTime: `${Math.max(5, (data.bugs?.length || 0) * 10)} minutes`
      };

      setAnalysis(transformedAnalysis);
      console.log('Analysis completed:', transformedAnalysis);
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateLovablePrompts = async () => {
    if (!code.trim()) {
      toast.error('Please provide some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Generating Lovable prompts...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-analysis', {
        body: {
          projectId: 'demo-project',
          code,
          analysisType: 'optimize'
        }
      });

      if (error) throw error;

      // Generate Lovable-specific prompts based on the optimization analysis
      const lovablePrompts = (data.optimizations || []).map((opt: any, index: number) => {
        const prompts = [
          `Refactor this component to improve performance: ${opt.suggestion}`,
          `Add TypeScript interfaces for better type safety in this component`,
          `Implement error boundaries around this component for better reliability`,
          `Add loading states and skeleton components to improve user experience`,
          `Extract custom hooks for better code organization and reusability`,
          `Add comprehensive form validation with helpful error messages`
        ];
        return prompts[index % prompts.length];
      });

      const transformedAnalysis = {
        summary: `Generated ${lovablePrompts.length} optimized Lovable prompts`,
        lovablePrompts,
        insights: (data.optimizations || []).map((opt: any) => opt.issue),
        recommendations: (data.optimizations || []).map((opt: any) => opt.suggestion)
      };

      setAnalysis(transformedAnalysis);
      console.log('Prompts generated:', transformedAnalysis);
    } catch (error: any) {
      console.error('Prompt generation failed:', error);
      toast.error(`Prompt generation failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      console.log('Sending chat message to AI...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-analysis', {
        body: {
          projectId: 'demo-project',
          code: `Context: ${code}\n\nQuestion: ${userMessage}`,
          analysisType: 'review'
        }
      });

      if (error) throw error;

      const aiResponse = data.summary || 'I analyzed your code and question. Here are my thoughts based on the analysis.';
      setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error: any) {
      console.error('Chat failed:', error);
      const errorResponse = 'I apologize, but I encountered an error while processing your question. Please try again.';
      setChatHistory(prev => [...prev, { role: 'ai', content: errorResponse }]);
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setTimeout(() => setCopiedPrompt(null), 2000);
      onApplyPrompt?.(prompt);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  const canUseFeature = (feature: string) => {
    if (userTier === 'enterprise') return true;
    if (userTier === 'premium') return feature !== 'architecture-advisor';
    return feature === 'basic-analysis';
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          CodeSense AI Assistant
          {userTier !== 'free' && <Crown className="h-4 w-4 text-gold-500" />}
        </CardTitle>
        <p className="text-sm text-blue-600">
          Powered by advanced AI for intelligent code analysis and optimization
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="smart">Smart Analysis</TabsTrigger>
            <TabsTrigger value="prompts">Lovable Prompts</TabsTrigger>
            <TabsTrigger value="chat">Ask AI</TabsTrigger>
            <TabsTrigger value="review">Code Review</TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleSmartAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Smart Analysis
                  </>
                )}
              </Button>

              {analysis && !analysis.lovablePrompts && (
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <Zap className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <strong>Analysis Complete!</strong> {analysis.summary}
                    </AlertDescription>
                  </Alert>

                  {analysis.codeQualityScore && (
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-sm font-medium">Code Quality Score</span>
                      <Badge className={
                        analysis.codeQualityScore >= 80 ? 'bg-green-100 text-green-800' :
                        analysis.codeQualityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {analysis.codeQualityScore}/100
                      </Badge>
                    </div>
                  )}

                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-800">Key Insights</h4>
                      <div className="space-y-1">
                        {analysis.insights.map((insight: string, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border-l-2 border-blue-300">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-800">Recommendations</h4>
                      <div className="space-y-1">
                        {analysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border-l-2 border-green-300">
                            💡 {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleGenerateLovablePrompts}
                disabled={isAnalyzing || !canUseFeature('prompt-generation')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Generate Perfect Prompts
                  </>
                )}
              </Button>

              {!canUseFeature('prompt-generation') && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Crown className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Upgrade to Premium for AI-generated Lovable prompts
                  </AlertDescription>
                </Alert>
              )}

              {analysis?.lovablePrompts && (
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-800">Perfect Lovable Prompts</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analysis.lovablePrompts.map((prompt: string, index: number) => (
                      <Card key={index} className="p-3 border border-purple-200 hover:border-purple-300 transition-colors">
                        <div className="space-y-2">
                          <p className="text-sm">{prompt}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPrompt(prompt)}
                            className="w-full text-xs"
                          >
                            {copiedPrompt === prompt ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy for Lovable
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-3">
              <ScrollArea className="h-64 w-full border rounded p-3 bg-white">
                <div className="space-y-3">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ask CodeSense AI anything about your code!</p>
                    </div>
                  )}
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-2 rounded text-sm ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about your code..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                  disabled={!canUseFeature('ai-chat')}
                />
                <Button onClick={handleChatMessage} disabled={!canUseFeature('ai-chat')}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>

              {!canUseFeature('ai-chat') && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Crown className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Upgrade to Premium for AI chat assistance
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-medium text-blue-800 mb-2">AI Code Review</h3>
              <p className="text-sm text-blue-600 mb-4">
                Get comprehensive code reviews with security, performance, and maintainability insights.
              </p>
              {canUseFeature('code-review') ? (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSmartAnalysis}>
                  Start AI Code Review
                </Button>
              ) : (
                <div className="space-y-2">
                  <Badge className="bg-gold-100 text-gold-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Feature
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Upgrade for AI-powered code reviews
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

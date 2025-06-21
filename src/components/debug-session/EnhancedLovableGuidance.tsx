
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Rocket,
  Copy,
  Crown
} from 'lucide-react';
import { GenspartAIEngine } from '@/services/ai/GenspartAIEngine';
import { LovablePromptSuggestion } from '@/services/LovableIntegration';

interface EnhancedLovableGuidanceProps {
  code: string;
  suggestions: LovablePromptSuggestion[];
  completionPercentage: number;
  deploymentBlockers: string[];
  missingFeatures: string[];
  userTier?: 'free' | 'premium' | 'enterprise';
  onSuggestionClick: (suggestion: LovablePromptSuggestion) => void;
}

export const EnhancedLovableGuidance: React.FC<EnhancedLovableGuidanceProps> = ({
  code,
  suggestions,
  completionPercentage,
  deploymentBlockers,
  missingFeatures,
  userTier = 'free',
  onSuggestionClick
}) => {
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  const aiEngine = React.useMemo(() => new GenspartAIEngine(), []);

  const generateAIPrompts = async () => {
    if (userTier === 'free') return;
    
    setIsGeneratingAI(true);
    try {
      console.log('🧠 Generating AI-powered Lovable prompts...');
      const prompts = await aiEngine.generateLovablePrompts(code, 'Enhanced guidance context');
      setAiPrompts(prompts);
    } catch (error) {
      console.error('Failed to generate AI prompts:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (userTier !== 'free' && code && aiPrompts.length === 0) {
      generateAIPrompts();
    }
  }, [code, userTier]);

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'enhancement': return <TrendingUp className="h-4 w-4" />;
      case 'feature': return <Target className="h-4 w-4" />;
      case 'quality': return <CheckCircle2 className="h-4 w-4" />;
      case 'deployment': return <Rocket className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCompletionStatus = () => {
    if (completionPercentage >= 90) return { text: 'Ready to Ship! 🚀', color: 'text-green-600' };
    if (completionPercentage >= 70) return { text: 'Almost Ready', color: 'text-blue-600' };
    if (completionPercentage >= 50) return { text: 'Good Progress', color: 'text-yellow-600' };
    return { text: 'Getting Started', color: 'text-orange-600' };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-4">
      {/* AI-Enhanced Project Status */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-5 w-5" />
            AI-Enhanced Project Status
            {userTier !== 'free' && <Crown className="h-4 w-4 text-gold-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Progress</span>
            <span className={`font-bold ${status.color}`}>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
        </CardContent>
      </Card>

      {/* AI-Generated Prompts Section */}
      {userTier !== 'free' && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="h-5 w-5" />
              AI-Generated Perfect Prompts
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </CardTitle>
            <p className="text-sm text-purple-600">
              CodeSense AI analyzed your code and generated these optimized prompts
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={generateAIPrompts}
              disabled={isGeneratingAI}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGeneratingAI ? 'AI Generating...' : 'Generate AI Prompts'}
            </Button>

            {aiPrompts.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {aiPrompts.map((prompt, index) => (
                  <Card key={index} className="p-3 border border-purple-200 hover:border-purple-300 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          AI Generated #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm">{prompt}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyPrompt(prompt)}
                        className="w-full text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        {copiedPrompt === prompt ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Perfect Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployment Blockers */}
      {deploymentBlockers.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Deployment Blockers ({deploymentBlockers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deploymentBlockers.map((blocker, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-700">{blocker}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Standard Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Enhanced Smart Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Curated prompts enhanced with AI insights
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Great work! No immediate suggestions.</p>
            </div>
          ) : (
            suggestions.slice(0, 5).map((suggestion, index) => (
              <Card key={index} className="p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(suggestion.category)}
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority} priority
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{suggestion.prompt}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    <p className="text-xs text-blue-600">💡 {suggestion.estimatedImpact}</p>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    Use This Prompt in Lovable
                  </Button>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {userTier === 'free' && (
        <Card className="border-gold-200 bg-gradient-to-r from-gold-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold-800">
              <Crown className="h-5 w-5" />
              Unlock AI-Powered Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gold-700">
                Get AI-generated perfect prompts tailored to your specific code
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs text-gold-600">
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  AI analyzes your code patterns
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Generates optimized Lovable prompts
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  Context-aware suggestions
                </div>
              </div>
              <Button className="w-full bg-gold-600 hover:bg-gold-700 text-white">
                Upgrade to Premium - $19/month
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {completionPercentage >= 90 && deploymentBlockers.length === 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Rocket className="h-8 w-8 mx-auto text-green-600" />
              <h3 className="font-bold text-green-800">🎉 Ready for Production!</h3>
              <p className="text-sm text-green-700">
                Your Lovable project has passed all AI quality checks and is ready to deploy.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Deploy Your App
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

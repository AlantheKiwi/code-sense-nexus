import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Zap, 
  Target, 
  TrendingUp, 
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  Code2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { GenspartAIEngine } from '@/services/ai/GenspartAIEngine';

interface EnhancedLovableGuidanceProps {
  codeIssues: any[];
  projectMetrics: {
    healthScore: number;
    performance: number;
    maintainability: number;
    userExperience: number;
  };
  onPromptSelected?: (prompt: string) => void;
}

export const EnhancedLovableGuidance: React.FC<EnhancedLovableGuidanceProps> = ({
  codeIssues,
  projectMetrics,
  onPromptSelected
}) => {
  const [lovablePrompts, setLovablePrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const aiEngine = new GenspartAIEngine();

  useEffect(() => {
    generateContextualPrompts();
  }, [codeIssues]);

  const generateContextualPrompts = async () => {
    if (!codeIssues?.length) return;
    
    setIsGenerating(true);
    try {
      // Create a context string from the code issues
      const codeContext = codeIssues.map(issue => 
        `${issue.type}: ${issue.description}`
      ).join('\n');
      
      const prompts = await aiEngine.generateLovablePrompts(codeContext);
      setLovablePrompts(prompts);
    } catch (error) {
      console.error('Failed to generate Lovable prompts:', error);
      // Use fallback prompts based on metrics
      setLovablePrompts(getFallbackPrompts());
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackPrompts = (): string[] => {
    const prompts = [];
    
    if (projectMetrics.performance < 80) {
      prompts.push('Optimize component rendering with React.memo and useMemo for better performance');
      prompts.push('Add loading states and skeleton components to improve perceived performance');
    }
    
    if (projectMetrics.maintainability < 80) {
      prompts.push('Extract reusable components and create a consistent design system');
      prompts.push('Add TypeScript interfaces for better type safety and code documentation');
    }
    
    if (projectMetrics.userExperience < 80) {
      prompts.push('Implement responsive design patterns for mobile-first user experience');
      prompts.push('Add comprehensive error handling with user-friendly error messages');
    }
    
    // Always include some general improvement prompts
    prompts.push('Add accessibility features with proper ARIA labels and keyboard navigation');
    prompts.push('Implement form validation with helpful error messages and success feedback');
    
    return prompts;
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setTimeout(() => setCopiedPrompt(null), 2000);
      onPromptSelected?.(prompt);
      toast.success('Prompt copied! Use it in Lovable to implement this improvement.');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return Clock;
    return Target;
  };

  return (
    <div className="space-y-6">
      {/* Lovable Health Metrics */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="h-5 w-5" />
            Lovable Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Health', value: projectMetrics.healthScore, icon: Heart },
              { label: 'Performance', value: projectMetrics.performance, icon: Zap },
              { label: 'Maintainability', value: projectMetrics.maintainability, icon: Target },
              { label: 'User Experience', value: projectMetrics.userExperience, icon: TrendingUp }
            ].map((metric) => {
              const IconComponent = getMetricIcon(metric.value);
              return (
                <div key={metric.label} className="text-center p-3 bg-white rounded-lg border">
                  <IconComponent className={`h-6 w-6 mx-auto mb-2 ${getMetricColor(metric.value)}`} />
                  <div className={`text-2xl font-bold ${getMetricColor(metric.value)}`}>
                    {metric.value}%
                  </div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Perfect Lovable Prompts */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Lightbulb className="h-5 w-5" />
            Perfect Lovable Prompts
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              AI Generated
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-600">
            Copy these prompts to Lovable for instant improvements
          </p>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-purple-300 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <p className="text-purple-600">Generating personalized Lovable prompts...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lovablePrompts.map((prompt, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{prompt}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPrompt(prompt)}
                      className="flex-shrink-0"
                    >
                      {copiedPrompt === prompt ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lovable Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in Lovable
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Export Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

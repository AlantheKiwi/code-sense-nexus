
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  DollarSign, 
  Zap, 
  Shield, 
  Target,
  Loader2,
  Check
} from 'lucide-react';
import { LLM_PROVIDERS, type LLMProvider, type AnalysisRequest } from '@/services/ai/LLMGateway';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { toast } from 'sonner';

interface LLMSelectorProps {
  analysisType: 'code_quality' | 'architecture' | 'security' | 'performance' | 'lovable_prompt';
  onAnalyze: (provider: string, request: AnalysisRequest) => void;
  code: string;
  projectContext?: string;
  userCredits?: number;
  isAnalyzing?: boolean;
}

export const LLMSelector: React.FC<LLMSelectorProps> = ({
  analysisType,
  onAnalyze,
  code,
  projectContext,
  userCredits = 0,
  isAnalyzing = false
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('gpt-4');
  const [showComparison, setShowComparison] = useState(false);
  const { subscription } = useUsageTracking();

  const selectedLLM = LLM_PROVIDERS[selectedProvider];
  const canAfford = userCredits >= selectedLLM.costPerRequest;
  const hasUnlimitedAccess = subscription?.tier === 'enterprise';

  const getAnalysisTypeIcon = () => {
    switch (analysisType) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'architecture': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getAnalysisTypeLabel = () => {
    const labels = {
      code_quality: 'Code Quality Analysis',
      architecture: 'Architecture Review',
      security: 'Security Audit',
      performance: 'Performance Analysis',
      lovable_prompt: 'Lovable Prompt Generation'
    };
    return labels[analysisType] || 'AI Analysis';
  };

  const getProviderRecommendation = (providerId: string) => {
    const recommendations = {
      'gpt-4': 'Best for complex architecture decisions and detailed explanations',
      'claude-3.5': 'Excellent for debugging and finding subtle issues',
      'gemini-pro': 'Fast and reliable for general code analysis',
      'perplexity': 'Research-backed recommendations with latest practices'
    };
    return recommendations[providerId] || '';
  };

  const handleAnalyze = () => {
    if (!canAfford && !hasUnlimitedAccess) {
      toast.error(`Insufficient credits. You need ${selectedLLM.costPerRequest} credits for this analysis.`);
      return;
    }

    if (!code.trim()) {
      toast.error('Please provide code to analyze');
      return;
    }

    const request: AnalysisRequest = {
      code,
      analysisType,
      projectContext
    };

    onAnalyze(selectedProvider, request);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getAnalysisTypeIcon()}
          {getAnalysisTypeLabel()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LLM Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Choose AI Assistant</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LLM_PROVIDERS).map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{provider.name}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary" className="text-xs">
                        {provider.costPerRequest} credits
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Provider Details */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{selectedLLM.name}</h4>
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span className="text-sm">
                {hasUnlimitedAccess ? 'Unlimited' : `${selectedLLM.costPerRequest} credits`}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">{selectedLLM.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.round(selectedLLM.estimatedTimeMs / 1000)}s
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {selectedLLM.strengths.map((strength) => (
              <Badge key={strength} variant="outline" className="text-xs">
                {strength}
              </Badge>
            ))}
          </div>

          <div className="text-xs text-blue-600">
            {getProviderRecommendation(selectedProvider)}
          </div>
        </div>

        {/* Credit Status */}
        {!hasUnlimitedAccess && (
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            canAfford ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <DollarSign className={`h-4 w-4 ${canAfford ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm">
                Your Credits: {userCredits}
              </span>
            </div>
            {canAfford ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Button size="sm" variant="outline">
                Buy Credits
              </Button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!canAfford && !hasUnlimitedAccess)}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze with {selectedLLM.name}
                {!hasUnlimitedAccess && ` (${selectedLLM.costPerRequest} credits)`}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            Compare
          </Button>
        </div>

        {/* LLM Comparison */}
        {showComparison && (
          <div className="space-y-3">
            <h4 className="font-medium">AI Assistant Comparison</h4>
            <div className="grid gap-3">
              {Object.values(LLM_PROVIDERS).map((provider) => (
                <div 
                  key={provider.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProvider === provider.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{provider.name}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      {Math.round(provider.estimatedTimeMs / 1000)}s
                      <DollarSign className="h-3 w-3 ml-2" />
                      {provider.costPerRequest}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{provider.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.strengths.slice(0, 2).map((strength) => (
                      <Badge key={strength} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


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
  Check,
  CheckCircle
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
  
  // Security audits cost more credits
  const actualCost = analysisType === 'security' ? selectedLLM.costPerRequest * 4 : selectedLLM.costPerRequest;
  const canAfford = userCredits >= actualCost;
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
      security: 'Professional Security Audit ($4.99)',
      performance: 'Performance Analysis',
      lovable_prompt: 'Lovable Prompt Generation'
    };
    return labels[analysisType] || 'AI Analysis';
  };

  const getProviderRecommendation = (providerId: string) => {
    if (analysisType === 'security') {
      const securityRecommendations = {
        'gemini-pro': '🥇 Best for Security Analysis - Exceptional vulnerability detection',
        'gpt-4': '🥈 Excellent for complex security patterns and compliance',
        'claude-3.5': '🥉 Strong at identifying data leakage and privacy issues',
        'perplexity': 'Good for latest security threat intelligence'
      };
      return securityRecommendations[providerId] || '';
    }

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
      toast.error(`Insufficient credits. You need ${actualCost} credits for this analysis.`);
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
          {analysisType === 'security' && (
            <Badge className="bg-red-100 text-red-800 border-red-300">
              PREMIUM
            </Badge>
          )}
        </CardTitle>
        {analysisType === 'security' && (
          <p className="text-sm text-red-600">
            🔒 Professional-grade security audit using multiple AI models for comprehensive vulnerability detection
          </p>
        )}
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
                    <span className="flex items-center gap-2">
                      {provider.name}
                      {analysisType === 'security' && provider.id === 'gemini-pro' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          RECOMMENDED
                        </Badge>
                      )}
                    </span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary" className="text-xs">
                        {actualCost} credits
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Provider Details */}
        <div className={`rounded-lg p-4 space-y-3 ${
          analysisType === 'security' ? 'bg-red-50 border border-red-200' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{selectedLLM.name}</h4>
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span className="text-sm">
                {hasUnlimitedAccess ? 'Unlimited' : `${actualCost} credits`}
              </span>
              {analysisType === 'security' && (
                <Badge variant="outline" className="text-xs">
                  4x Enhanced Analysis
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600">{selectedLLM.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.round(selectedLLM.estimatedTimeMs / 1000) * (analysisType === 'security' ? 3 : 1)}s
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {selectedLLM.strengths.map((strength) => (
              <Badge key={strength} variant="outline" className="text-xs">
                {strength}
              </Badge>
            ))}
          </div>

          <div className={`text-xs ${analysisType === 'security' ? 'text-red-600' : 'text-blue-600'}`}>
            {getProviderRecommendation(selectedProvider)}
          </div>
        </div>

        {/* Security Audit Features */}
        {analysisType === 'security' && (
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3">Professional Security Audit Includes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-red-500" />
                Vulnerability Detection
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-red-500" />
                OWASP Top 10 Analysis
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-red-500" />
                Multi-AI Validation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-red-500" />
                Compliance Assessment
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-red-500" />
                Code Fix Examples
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-red-500" />
                Executive Summary
              </div>
            </div>
          </div>
        )}

        {/* Credit Status */}
        {!hasUnlimitedAccess && (
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            canAfford ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <DollarSign className={`h-4 w-4 ${canAfford ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm">
                Your Credits: {userCredits} {analysisType === 'security' && `(Need ${actualCost})`}
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
            className={`flex-1 ${
              analysisType === 'security' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {analysisType === 'security' ? 'Security Auditing...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {analysisType === 'security' ? 'Start Security Audit' : `Analyze with ${selectedLLM.name}`}
                {!hasUnlimitedAccess && ` (${actualCost} credits)`}
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
                    <span className="font-medium flex items-center gap-2">
                      {provider.name}
                      {analysisType === 'security' && provider.id === 'gemini-pro' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          BEST FOR SECURITY
                        </Badge>
                      )}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      {Math.round(provider.estimatedTimeMs / 1000) * (analysisType === 'security' ? 3 : 1)}s
                      <DollarSign className="h-3 w-3 ml-2" />
                      {analysisType === 'security' ? provider.costPerRequest * 4 : provider.costPerRequest}
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
                  {analysisType === 'security' && (
                    <div className="text-xs text-red-600 mt-2">
                      {getProviderRecommendation(provider.id)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

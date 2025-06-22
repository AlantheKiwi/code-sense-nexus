
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock } from 'lucide-react';
import { LLMProvider } from '@/services/ai/LLMGateway';

interface ProviderCardProps {
  provider: LLMProvider;
  isSelected: boolean;
  analysisType: string;
  onSelect: () => void;
  getProviderRecommendation: (providerId: string) => string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isSelected,
  analysisType,
  onSelect,
  getProviderRecommendation
}) => {
  const actualCost = analysisType === 'security' ? provider.costPerRequest * 4 : provider.costPerRequest;

  return (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
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
          {actualCost}
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
  );
};

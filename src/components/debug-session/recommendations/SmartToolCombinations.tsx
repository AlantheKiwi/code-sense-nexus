
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Code, Users, Clock } from 'lucide-react';

interface SmartToolCombinationsProps {
  selectedTools: string[];
  projectContext: any;
  onApplyRecommendation: (tools: string[]) => void;
}

const toolCombinations = {
  'code-quality-focus': {
    name: 'Code Quality Focus',
    icon: Code,
    tools: ['eslint', 'accessibility'],
    description: 'Perfect for development phase with focus on maintainable code',
    benefits: ['Clean code standards', 'Better accessibility', 'Faster development'],
    estimatedTime: '45s',
    compatibility: 95
  },
  'performance-security': {
    name: 'Performance & Security',
    icon: Shield,
    tools: ['lighthouse', 'snyk'],
    description: 'Comprehensive performance and security analysis',
    benefits: ['Faster load times', 'Security vulnerabilities detection', 'SEO improvements'],
    estimatedTime: '90s',
    compatibility: 90
  },
  'full-audit': {
    name: 'Complete Audit',
    icon: Zap,
    tools: ['eslint', 'lighthouse', 'snyk', 'accessibility'],
    description: 'All-in-one analysis for production-ready applications',
    benefits: ['Complete coverage', 'Production ready', 'All-round quality'],
    estimatedTime: '2m 30s',
    compatibility: 85
  },
  'quick-dev': {
    name: 'Quick Development Check',
    icon: Clock,
    tools: ['eslint'],
    description: 'Fast feedback during active development',
    benefits: ['Instant feedback', 'Minimal disruption', 'Focus on coding'],
    estimatedTime: '20s',
    compatibility: 100
  }
};

export const SmartToolCombinations = ({ selectedTools, projectContext, onApplyRecommendation }: SmartToolCombinationsProps) => {
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isCurrentSelection = (tools: string[]) => {
    return tools.length === selectedTools.length && 
           tools.every(tool => selectedTools.includes(tool));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Smart Tool Combinations</h3>
        <p className="text-muted-foreground">
          Curated tool sets that work best together for your project type
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(toolCombinations).map(([key, combo]) => {
          const IconComponent = combo.icon;
          const isCurrent = isCurrentSelection(combo.tools);
          
          return (
            <Card key={key} className={`transition-all ${isCurrent ? 'border-green-300 bg-green-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{combo.name}</h4>
                      <p className="text-sm text-muted-foreground">{combo.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCompatibilityColor(combo.compatibility)}>
                      {combo.compatibility}% match
                    </Badge>
                    {isCurrent && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-1">
                    {combo.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Est. time: {combo.estimatedTime}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <h5 className="text-sm font-medium">Benefits:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {combo.benefits.map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? "secondary" : "default"}
                  onClick={() => onApplyRecommendation(combo.tools)}
                  disabled={isCurrent}
                  className="w-full"
                >
                  {isCurrent ? 'Currently Selected' : 'Apply Combination'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

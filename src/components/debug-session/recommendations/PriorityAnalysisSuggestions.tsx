
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Rocket, Globe, AlertTriangle } from 'lucide-react';

interface PriorityAnalysisSuggestionsProps {
  projectContext: any;
  onApplyRecommendation: (tools: string[]) => void;
}

const stageRecommendations = {
  development: {
    name: 'Development Stage',
    icon: Target,
    priority: 'Code Quality First',
    tools: ['eslint', 'accessibility'],
    description: 'Focus on maintainable code and early issue detection',
    reasoning: 'Catch issues early when they\'re easier to fix',
    urgency: 'medium',
    benefits: ['Cleaner codebase', 'Faster debugging', 'Better team collaboration']
  },
  'pre-launch': {
    name: 'Pre-Launch Stage',
    icon: Rocket,
    priority: 'Performance & Security',
    tools: ['lighthouse', 'snyk', 'accessibility'],
    description: 'Ensure your app is ready for production',
    reasoning: 'Critical issues must be resolved before users arrive',
    urgency: 'high',
    benefits: ['Production readiness', 'User experience optimization', 'Security compliance']
  },
  production: {
    name: 'Live Production',
    icon: Globe,
    priority: 'Monitoring & Maintenance',
    tools: ['lighthouse', 'snyk'],
    description: 'Continuous monitoring and security updates',
    reasoning: 'Maintain performance and security for live users',
    urgency: 'high',
    benefits: ['User satisfaction', 'Security protection', 'Performance monitoring']
  },
  maintenance: {
    name: 'Maintenance Mode',
    icon: AlertTriangle,
    priority: 'Security & Updates',
    tools: ['snyk', 'eslint'],
    description: 'Keep dependencies secure and code clean',
    reasoning: 'Regular maintenance prevents technical debt',
    urgency: 'low',
    benefits: ['Security updates', 'Dependency management', 'Code quality maintenance']
  }
};

export const PriorityAnalysisSuggestions = ({ projectContext, onApplyRecommendation }: PriorityAnalysisSuggestionsProps) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Priority Analysis by Stage</h3>
        <p className="text-muted-foreground">
          Recommendations based on your project's current development stage
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(stageRecommendations).map(([key, stage]) => {
          const IconComponent = stage.icon;
          const isCurrentStage = key === projectContext.stage;
          
          return (
            <Card key={key} className={`transition-all ${isCurrentStage ? 'border-blue-300 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{stage.name}</h4>
                      <p className="text-sm font-medium text-blue-600">{stage.priority}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getUrgencyColor(stage.urgency)}>
                      {stage.urgency} priority
                    </Badge>
                    {isCurrentStage && (
                      <Badge variant="default">Current Stage</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {stage.description}
                </p>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-1">
                    {stage.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <h5 className="text-sm font-medium mb-1">Why this matters:</h5>
                  <p className="text-xs text-muted-foreground">{stage.reasoning}</p>
                </div>

                <div className="space-y-1 mb-3">
                  <h5 className="text-sm font-medium">Expected benefits:</h5>
                  <ul className="text-xs text-muted-foreground">
                    {stage.benefits.map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="sm"
                  variant={isCurrentStage ? "default" : "outline"}
                  onClick={() => onApplyRecommendation(stage.tools)}
                  className="w-full"
                >
                  Apply {stage.name} Tools
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

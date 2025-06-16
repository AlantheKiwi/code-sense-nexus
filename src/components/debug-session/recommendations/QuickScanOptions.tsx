
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Search, Target, Clock } from 'lucide-react';

interface QuickScanOptionsProps {
  projectContext: any;
  onApplyRecommendation: (tools: string[]) => void;
}

const scanOptions = {
  'quick-scan': {
    name: 'Quick Scan',
    icon: Zap,
    duration: '30 seconds',
    tools: ['eslint'],
    description: 'Fast code quality check for immediate feedback',
    coverage: 'Code quality basics',
    useCase: 'During active development',
    intensity: 'Light'
  },
  'standard-scan': {
    name: 'Standard Scan',
    icon: Search,
    duration: '2 minutes',
    tools: ['eslint', 'lighthouse'],
    description: 'Balanced analysis covering code and performance',
    coverage: 'Code quality + Performance',
    useCase: 'Regular development checkpoints',
    intensity: 'Medium'
  },
  'deep-analysis': {
    name: 'Deep Analysis',
    icon: Target,
    duration: '5 minutes',
    tools: ['eslint', 'lighthouse', 'snyk', 'accessibility'],
    description: 'Comprehensive analysis for production readiness',
    coverage: 'Complete quality assessment',
    useCase: 'Pre-deployment or major releases',
    intensity: 'Thorough'
  }
};

export const QuickScanOptions = ({ projectContext, onApplyRecommendation }: QuickScanOptionsProps) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Light': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Thorough': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Analysis Depth Options</h3>
        <p className="text-muted-foreground">
          Choose the right level of analysis based on your time and needs
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(scanOptions).map(([key, option]) => {
          const IconComponent = option.icon;
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{option.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{option.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getIntensityColor(option.intensity)}>
                    {option.intensity}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-xs font-medium">Tools: </span>
                    <div className="flex gap-1 mt-1">
                      {option.tools.map(tool => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium">Coverage: </span>
                    <span className="text-muted-foreground">{option.coverage}</span>
                  </div>
                  
                  <div className="text-xs">
                    <span className="font-medium">Best for: </span>
                    <span className="text-muted-foreground">{option.useCase}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onApplyRecommendation(option.tools)}
                  className="w-full"
                >
                  Start {option.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-blue-800">
          Use Quick Scan during development, Standard Scan for regular checks, 
          and Deep Analysis before major releases or deployments.
        </p>
      </div>
    </div>
  );
};

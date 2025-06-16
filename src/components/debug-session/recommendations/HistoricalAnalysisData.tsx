
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, Award, RefreshCw } from 'lucide-react';

interface HistoricalAnalysisDataProps {
  projectId?: string;
  onApplyRecommendation: (tools: string[]) => void;
}

const historicalData = {
  'most-effective': {
    name: 'Most Effective Combination',
    icon: Award,
    tools: ['eslint', 'lighthouse'],
    metrics: {
      issuesFound: 47,
      fixRate: '89%',
      timeToFix: '2.3 hours',
      satisfaction: '94%'
    },
    description: 'Your best performing tool combination based on past results',
    lastUsed: '3 days ago',
    effectiveness: 94
  },
  'trending-up': {
    name: 'Trending Improvement',
    icon: TrendingUp,
    tools: ['accessibility', 'eslint'],
    metrics: {
      issuesFound: 23,
      fixRate: '76%',
      timeToFix: '1.8 hours',
      satisfaction: '87%'
    },
    description: 'Combination showing consistent improvement in recent analyses',
    lastUsed: '1 week ago',
    effectiveness: 87
  },
  'recently-successful': {
    name: 'Recently Successful',
    icon: RefreshCw,
    tools: ['snyk', 'lighthouse'],
    metrics: {
      issuesFound: 31,
      fixRate: '82%',
      timeToFix: '3.1 hours',
      satisfaction: '91%'
    },
    description: 'Latest successful analysis that led to significant improvements',
    lastUsed: '5 days ago',
    effectiveness: 91
  }
};

export const HistoricalAnalysisData = ({ projectId, onApplyRecommendation }: HistoricalAnalysisDataProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Historical Analysis Insights</h3>
        <p className="text-muted-foreground">
          Recommendations based on your past analysis results and effectiveness
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {['7days', '30days', '90days'].map(period => (
          <Button
            key={period}
            size="sm"
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
          >
            {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : '90 Days'}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {Object.entries(historicalData).map(([key, data]) => {
          const IconComponent = data.icon;
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{data.name}</h4>
                      <p className="text-xs text-muted-foreground">Last used: {data.lastUsed}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getEffectivenessColor(data.effectiveness)}>
                    {data.effectiveness}% effective
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {data.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex gap-1">
                    {data.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Issues Found: </span>
                      <span className="text-muted-foreground">{data.metrics.issuesFound}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Fix Rate: </span>
                      <span className="text-muted-foreground">{data.metrics.fixRate}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Avg. Fix Time: </span>
                      <span className="text-muted-foreground">{data.metrics.timeToFix}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Satisfaction: </span>
                      <span className="text-muted-foreground">{data.metrics.satisfaction}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onApplyRecommendation(data.tools)}
                  className="w-full"
                >
                  Apply Historical Best
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(historicalData).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Historical Data Yet</h3>
            <p className="text-muted-foreground">
              Run some analyses to build up historical insights and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

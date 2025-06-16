
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, TrendingUp, Eye } from 'lucide-react';

interface PeerRecommendationsProps {
  onApplyRecommendation: (tools: string[]) => void;
}

const peerData = {
  'popular-react': {
    name: 'Popular in React Projects',
    icon: Star,
    tools: ['eslint', 'lighthouse', 'accessibility'],
    stats: {
      usage: '78%',
      projects: '2,431',
      satisfaction: '4.6/5',
      trend: 'up'
    },
    description: 'Most commonly used combination by React developers',
    category: 'React Applications'
  },
  'trending-combo': {
    name: 'Trending This Month',
    icon: TrendingUp,
    tools: ['snyk', 'lighthouse'],
    stats: {
      usage: '34%',
      projects: '892',
      satisfaction: '4.4/5',
      trend: 'up'
    },
    description: 'Fast-growing combination gaining popularity',
    category: 'Security & Performance'
  },
  'enterprise-choice': {
    name: 'Enterprise Standard',
    icon: Users,
    tools: ['eslint', 'snyk', 'accessibility'],
    stats: {
      usage: '56%',
      projects: '1,203',
      satisfaction: '4.5/5',
      trend: 'stable'
    },
    description: 'Preferred by large teams and enterprise projects',
    category: 'Enterprise Projects'
  }
};

export const PeerRecommendations = ({ onApplyRecommendation }: PeerRecommendationsProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <Eye className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">What Similar Projects Use</h3>
        <p className="text-muted-foreground">
          Popular tool combinations from projects similar to yours
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(peerData).map(([key, peer]) => {
          const IconComponent = peer.icon;
          
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{peer.name}</h4>
                      <p className="text-xs text-muted-foreground">{peer.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(peer.stats.trend)}
                    <span className={`text-xs ${getTrendColor(peer.stats.trend)}`}>
                      {peer.stats.trend}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {peer.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex gap-1">
                    {peer.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{peer.stats.usage}</div>
                    <div className="text-xs text-muted-foreground">Usage Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{peer.stats.projects}</div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{peer.stats.satisfaction}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onApplyRecommendation(peer.tools)}
                  className="w-full"
                >
                  Try Popular Choice
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">📊 Data Sources</h4>
        <p className="text-sm text-gray-600">
          Recommendations based on anonymous usage data from 50,000+ projects 
          across similar tech stacks and project sizes.
        </p>
      </div>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, Shield } from 'lucide-react';

interface ToolImpactExplanationsProps {
  advancedMode: boolean;
  selectedTools: string[];
}

const impactData = {
  eslint: {
    name: 'ESLint',
    impacts: [
      { metric: 'Bug Prevention', value: 85, description: 'Catches 85% of common JavaScript errors before they reach production' },
      { metric: 'Development Speed', value: 40, description: '40% faster debugging due to early error detection' },
      { metric: 'Code Consistency', value: 95, description: '95% improvement in code style consistency across team' },
      { metric: 'Maintenance Cost', value: -60, description: '60% reduction in time spent on code maintenance' }
    ],
    businessValue: 'Saves $50,000+ annually in developer time and reduced bug fixes',
    userExperience: 'Fewer crashes and unexpected behaviors for end users'
  },
  lighthouse: {
    name: 'Lighthouse',
    impacts: [
      { metric: 'Page Load Speed', value: 65, description: 'Average 65% improvement in Core Web Vitals scores' },
      { metric: 'SEO Ranking', value: 30, description: '30% boost in search engine visibility' },
      { metric: 'Conversion Rate', value: 25, description: '25% increase in user conversion rates' },
      { metric: 'User Satisfaction', value: 45, description: '45% improvement in user experience metrics' }
    ],
    businessValue: 'Increases revenue by $25,000+ monthly through better performance',
    userExperience: 'Faster, smoother website experience leading to higher engagement'
  },
  snyk: {
    name: 'Snyk',
    impacts: [
      { metric: 'Vulnerability Detection', value: 90, description: '90% of security vulnerabilities identified and fixed' },
      { metric: 'Compliance Score', value: 80, description: '80% improvement in security compliance ratings' },
      { metric: 'Incident Prevention', value: 95, description: '95% reduction in security-related incidents' },
      { metric: 'Risk Mitigation', value: 70, description: '70% decrease in overall security risk exposure' }
    ],
    businessValue: 'Prevents potential $500,000+ losses from security breaches',
    userExperience: 'Protected personal data and secure interactions'
  },
  accessibility: {
    name: 'Accessibility Checker',
    impacts: [
      { metric: 'User Reach', value: 20, description: '20% increase in addressable user base' },
      { metric: 'Legal Compliance', value: 100, description: '100% WCAG compliance achievement' },
      { metric: 'Usability Score', value: 35, description: '35% improvement in usability for all users' },
      { metric: 'Brand Reputation', value: 50, description: '50% boost in inclusive brand perception' }
    ],
    businessValue: 'Expands market reach by 15% and avoids $100,000+ legal costs',
    userExperience: 'Everyone can use your website, regardless of abilities'
  }
};

export const ToolImpactExplanations = ({ advancedMode, selectedTools }: ToolImpactExplanationsProps) => {
  const getImpactColor = (value: number) => {
    if (value < 0) return 'text-green-600'; // Cost reduction
    if (value < 30) return 'text-yellow-600';
    if (value < 60) return 'text-blue-600';
    return 'text-green-600';
  };

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-yellow-500';
    if (value < 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Business Impact & ROI</h3>
        <p className="text-muted-foreground">
          {advancedMode 
            ? 'Detailed analysis of how each tool drives business value and technical improvements'
            : 'See how these tools help your business succeed and save money'
          }
        </p>
      </div>

      {selectedTools.length > 0 ? (
        <div className="grid gap-6">
          {selectedTools.map(toolId => {
            const tool = impactData[toolId as keyof typeof impactData];
            if (!tool) return null;

            return (
              <Card key={toolId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {tool.name} Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {tool.impacts.map((impact, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{impact.metric}</span>
                          <Badge variant="outline" className={getImpactColor(Math.abs(impact.value))}>
                            {impact.value > 0 ? '+' : ''}{impact.value}%
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.abs(impact.value)} 
                          className="h-2"
                        />
                        {advancedMode && (
                          <p className="text-xs text-muted-foreground">{impact.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <h4 className="text-sm font-medium">Business Value</h4>
                        <p className="text-sm text-muted-foreground">{tool.businessValue}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium">User Experience</h4>
                        <p className="text-sm text-muted-foreground">{tool.userExperience}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Tools to See Impact</h3>
            <p className="text-muted-foreground">
              Choose analysis tools from the Overview tab to see their business impact and ROI.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

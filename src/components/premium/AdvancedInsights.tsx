
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Zap, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  Crown
} from 'lucide-react';

interface AdvancedInsightsProps {
  projectType: 'dashboard' | 'ecommerce' | 'saas' | 'portfolio' | 'other';
  componentCount: number;
  codeComplexity: 'low' | 'medium' | 'high';
  isPremium: boolean;
}

interface Insight {
  type: 'architecture' | 'performance' | 'security' | 'scalability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({
  projectType,
  componentCount,
  codeComplexity,
  isPremium
}) => {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Architecture insights based on project type
    if (projectType === 'saas' || projectType === 'dashboard') {
      insights.push({
        type: 'architecture',
        priority: 'high',
        title: 'Consider State Management',
        description: 'SaaS applications benefit from centralized state management',
        recommendation: 'Implement Zustand or Context API for user authentication and app-wide state',
        impact: 'Reduces prop drilling and improves maintainability',
        effort: 'medium'
      });
    }

    // Scalability warnings based on component count
    if (componentCount > 40) {
      insights.push({
        type: 'scalability',
        priority: 'high',
        title: 'Component Organization Warning',
        description: 'Your project is approaching structural complexity limits',
        recommendation: 'Organize components into feature-based folders and consider lazy loading',
        impact: 'Prevents future development bottlenecks',
        effort: 'medium'
      });
    }

    // Performance insights
    if (codeComplexity === 'high') {
      insights.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimization Opportunities',
        description: 'Complex components may benefit from performance optimizations',
        recommendation: 'Use React.memo for expensive components and implement code splitting',
        impact: 'Improves user experience and loading times',
        effort: 'low'
      });
    }

    // Security insights
    insights.push({
      type: 'security',
      priority: 'medium',
      title: 'Security Best Practices',
      description: 'Enhance security with modern React patterns',
      recommendation: 'Add Content Security Policy headers and sanitize user inputs',
      impact: 'Protects against XSS and injection attacks',
      effort: 'low'
    });

    return insights;
  };

  const insights = generateInsights();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'architecture': return <Lightbulb className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'scalability': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isPremium) {
    return (
      <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gold-800">
            <Crown className="h-5 w-5" />
            Advanced Insights (Premium)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-gold-200 bg-gold-50">
            <Crown className="h-4 w-4 text-gold-600" />
            <AlertDescription className="text-gold-700">
              Unlock advanced architecture recommendations, performance insights, 
              and scalability warnings with CodeSense Premium.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gold-700">Premium features include:</div>
            <ul className="text-sm text-gold-600 space-y-1 ml-4">
              <li>• Architecture recommendations for your project type</li>
              <li>• Performance optimization suggestions</li>
              <li>• Security best practices analysis</li>
              <li>• Scalability warnings and solutions</li>
              <li>• Custom rules for your team</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Crown className="h-5 w-5 text-gold-500" />
          Advanced Insights
        </CardTitle>
        <div className="text-sm text-purple-600">
          Powered by analysis of {componentCount} components • {codeComplexity} complexity project
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(insight.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority} priority
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{insight.description}</p>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">Recommendation:</div>
                  <div className="text-sm text-blue-700">{insight.recommendation}</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <strong>Impact:</strong> {insight.impact}
                  </span>
                  <span className={`font-medium ${getEffortColor(insight.effort)}`}>
                    {insight.effort} effort
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Project-specific insights */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-indigo-600" />
            <span className="font-medium text-indigo-800">Project-Specific Insight</span>
          </div>
          <div className="text-sm text-indigo-700">
            {projectType === 'saas' && 
              `For SaaS applications like yours, consider implementing user onboarding flows and feature flagging for better user experience.`
            }
            {projectType === 'ecommerce' && 
              `E-commerce projects benefit from product search optimization and cart persistence across sessions.`
            }
            {projectType === 'dashboard' && 
              `Dashboard applications should prioritize data visualization performance and real-time updates.`
            }
            {projectType === 'portfolio' && 
              `Portfolio sites excel with optimized images, fast loading times, and SEO optimization.`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Zap, 
  Target, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Crown,
  TrendingUp
} from 'lucide-react';
import { GenspartAIEngine } from '@/services/ai/GenspartAIEngine';

interface AICodeReviewPanelProps {
  code: string;
  userTier: 'free' | 'premium' | 'enterprise';
  onReviewComplete?: (review: any) => void;
}

export const AICodeReviewPanel: React.FC<AICodeReviewPanelProps> = ({
  code,
  userTier,
  onReviewComplete
}) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('security');

  const aiEngine = React.useMemo(() => new GenspartAIEngine(), []);

  const handleStartReview = async () => {
    if (userTier === 'free') return;

    setIsReviewing(true);
    try {
      console.log('🧠 Starting comprehensive AI code review...');
      
      const [securityReview, performanceReview, architectureReview] = await Promise.all([
        aiEngine.analyzeCode({
          code,
          projectType: 'react',
          analysisType: 'debugging',
          context: { userTier }
        }),
        aiEngine.analyzeCode({
          code,
          projectType: 'react',
          analysisType: 'optimization',
          context: { userTier }
        }),
        aiEngine.analyzeCode({
          code,
          projectType: 'react',
          analysisType: 'architecture',
          context: { userTier }
        })
      ]);

      const comprehensiveReview = {
        security: securityReview,
        performance: performanceReview,
        architecture: architectureReview,
        overallScore: Math.round((
          (securityReview.codeQualityScore || 70) +
          (performanceReview.codeQualityScore || 70) +
          (architectureReview.codeQualityScore || 70)
        ) / 3)
      };

      setReview(comprehensiveReview);
      onReviewComplete?.(comprehensiveReview);
    } catch (error) {
      console.error('AI code review failed:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="h-5 w-5" />
          AI Code Review Suite
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            PREMIUM
          </Badge>
        </CardTitle>
        <p className="text-sm text-purple-600">
          Comprehensive AI-powered code analysis with security, performance, and architecture insights
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {userTier === 'free' ? (
          <div className="text-center py-8 space-y-4">
            <Crown className="h-12 w-12 mx-auto text-gold-500" />
            <h3 className="font-medium text-gray-800">Premium AI Code Review</h3>
            <p className="text-sm text-gray-600">
              Get comprehensive security, performance, and architecture analysis powered by advanced AI
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Security vulnerability detection
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Performance optimization insights
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                Architecture recommendations
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Code quality scoring
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Upgrade to Premium
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleStartReview}
              disabled={isReviewing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isReviewing ? 'AI Reviewing Code...' : 'Start Comprehensive AI Review'}
            </Button>

            {isReviewing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Running AI Analysis...
                  </Badge>
                </div>
                <Progress value={66} className="w-full" />
                <p className="text-xs text-purple-600">
                  Analyzing security, performance, and architecture patterns...
                </p>
              </div>
            )}

            {review && (
              <div className="space-y-4">
                {/* Overall Score */}
                <Card className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Code Quality</span>
                    <Badge className={getScoreBadge(review.overallScore)}>
                      {review.overallScore}/100
                    </Badge>
                  </div>
                  <Progress value={review.overallScore} className="mt-2" />
                </Card>

                {/* Detailed Review Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  </TabsList>

                  <TabsContent value="security" className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Security Analysis</span>
                        <Badge className={getScoreBadge(review.security.codeQualityScore || 70)}>
                          {review.security.codeQualityScore || 70}/100
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {review.security.insights?.map((insight: string, index: number) => (
                          <div key={index} className="text-sm p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Performance Analysis</span>
                        <Badge className={getScoreBadge(review.performance.codeQualityScore || 70)}>
                          {review.performance.codeQualityScore || 70}/100
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {review.performance.insights?.map((insight: string, index: number) => (
                          <div key={index} className="text-sm p-2 bg-yellow-50 rounded border-l-2 border-yellow-300">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="architecture" className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Architecture Analysis</span>
                        <Badge className={getScoreBadge(review.architecture.codeQualityScore || 70)}>
                          {review.architecture.codeQualityScore || 70}/100
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {review.architecture.insights?.map((insight: string, index: number) => (
                          <div key={index} className="text-sm p-2 bg-green-50 rounded border-l-2 border-green-300">
                            {insight}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Items */}
                <Card className="p-4 bg-white">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Recommended Actions
                  </h4>
                  <div className="space-y-1">
                    {review.security.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Target,
  Award,
  BookOpen
} from 'lucide-react';

interface UserSuccessMetricsProps {
  userId: string;
}

interface SuccessMetrics {
  fixesApplied: number;
  successRate: number;
  timeSavedMinutes: number;
  patternsLearned: number;
  streakDays: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  nextMilestone: string;
  progressToNext: number;
}

export const UserSuccessMetrics: React.FC<UserSuccessMetricsProps> = ({ userId }) => {
  // In a real implementation, this would fetch from your analytics service
  const metrics: SuccessMetrics = {
    fixesApplied: 47,
    successRate: 94,
    timeSavedMinutes: 340,
    patternsLearned: 12,
    streakDays: 7,
    skillLevel: 'Intermediate',
    nextMilestone: 'Advanced Developer',
    progressToNext: 65
  };

  const getSkillColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Your Success Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Level & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getSkillColor(metrics.skillLevel)}>
              {metrics.skillLevel} Developer
            </Badge>
            <span className="text-sm text-gray-600">
              {metrics.progressToNext}% to {metrics.nextMilestone}
            </span>
          </div>
          <Progress value={metrics.progressToNext} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{metrics.successRate}%</div>
            <div className="text-xs text-green-600">of fixes applied successfully</div>
          </div>

          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Time Saved</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">{Math.floor(metrics.timeSavedMinutes / 60)}h {metrics.timeSavedMinutes % 60}m</div>
            <div className="text-xs text-blue-600">debugging time saved</div>
          </div>

          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Fixes Applied</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">{metrics.fixesApplied}</div>
            <div className="text-xs text-purple-600">total improvements made</div>
          </div>

          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Patterns Learned</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">{metrics.patternsLearned}</div>
            <div className="text-xs text-orange-600">Lovable patterns mastered</div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              🔥 {metrics.streakDays} day debugging streak!
            </span>
          </div>
          <div className="text-sm text-yellow-700 mt-1">
            Keep it up! You're becoming a debugging expert.
          </div>
        </div>

        {/* Community Stats */}
        <div className="text-center pt-2 border-t">
          <div className="text-sm text-gray-600">
            You're in the <span className="font-semibold text-blue-600">top 15%</span> of CodeSense users!
          </div>
          <div className="text-xs text-gray-500 mt-1">
            94% of users successfully apply our fix suggestions
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

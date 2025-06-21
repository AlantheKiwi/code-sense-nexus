
import { supabase } from '@/integrations/supabase/client';

export interface ProjectHealthSnapshot {
  id: string;
  projectId: string;
  timestamp: Date;
  overallScore: number;
  codeQuality: number;
  security: number;
  performance: number;
  accessibility: number;
  maintainability: number;
  issuesFixed: number;
  newIssuesFound: number;
  sessionId?: string;
}

export interface ProjectHealthTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ProjectHealthReport {
  projectId: string;
  reportDate: Date;
  currentHealth: ProjectHealthSnapshot;
  trends: ProjectHealthTrend[];
  predictions: ProjectPrediction[];
  recommendations: string[];
  timeToOptimal: string;
}

export interface ProjectPrediction {
  type: 'warning' | 'opportunity' | 'milestone';
  message: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
}

export class ProjectHealthTracker {
  async trackHealthSnapshot(projectId: string, healthData: Omit<ProjectHealthSnapshot, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_health_snapshots')
        .insert({
          project_id: projectId,
          overall_score: healthData.overallScore,
          code_quality: healthData.codeQuality,
          security: healthData.security,
          performance: healthData.performance,
          accessibility: healthData.accessibility,
          maintainability: healthData.maintainability,
          issues_fixed: healthData.issuesFixed,
          new_issues_found: healthData.newIssuesFound,
          session_id: healthData.sessionId
        });

      if (error) {
        console.error('Error tracking health snapshot:', error);
      }
    } catch (error) {
      console.error('Exception tracking health snapshot:', error);
    }
  }

  async getProjectHealthHistory(projectId: string, days: number = 30): Promise<ProjectHealthSnapshot[]> {
    try {
      const { data, error } = await supabase
        .from('project_health_snapshots')
        .select('*')
        .eq('project_id', projectId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching health history:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        projectId: item.project_id,
        timestamp: new Date(item.created_at),
        overallScore: item.overall_score,
        codeQuality: item.code_quality,
        security: item.security,
        performance: item.performance,
        accessibility: item.accessibility,
        maintainability: item.maintainability,
        issuesFixed: item.issues_fixed,
        newIssuesFound: item.new_issues_found,
        sessionId: item.session_id
      })) || [];
    } catch (error) {
      console.error('Exception fetching health history:', error);
      return [];
    }
  }

  async generateHealthReport(projectId: string): Promise<ProjectHealthReport> {
    const history = await this.getProjectHealthHistory(projectId);
    
    if (history.length === 0) {
      throw new Error('No health data available for this project');
    }

    const current = history[0];
    const previous = history[1];

    // Calculate trends
    const trends: ProjectHealthTrend[] = [];
    if (previous) {
      const metrics = [
        { key: 'overallScore', name: 'Overall Health' },
        { key: 'codeQuality', name: 'Code Quality' },
        { key: 'security', name: 'Security' },
        { key: 'performance', name: 'Performance' },
        { key: 'accessibility', name: 'Accessibility' },
        { key: 'maintainability', name: 'Maintainability' }
      ];

      metrics.forEach(metric => {
        const currentValue = current[metric.key as keyof ProjectHealthSnapshot] as number;
        const previousValue = previous[metric.key as keyof ProjectHealthSnapshot] as number;
        const change = currentValue - previousValue;
        
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (Math.abs(change) > 2) {
          trend = change > 0 ? 'improving' : 'declining';
        }

        trends.push({
          metric: metric.name,
          current: currentValue,
          previous: previousValue,
          change,
          trend
        });
      });
    }

    // Generate predictions
    const predictions = this.generatePredictions(history);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(current, trends);

    // Calculate time to optimal
    const timeToOptimal = this.calculateTimeToOptimal(trends);

    return {
      projectId,
      reportDate: new Date(),
      currentHealth: current,
      trends,
      predictions,
      recommendations,
      timeToOptimal
    };
  }

  private generatePredictions(history: ProjectHealthSnapshot[]): ProjectPrediction[] {
    const predictions: ProjectPrediction[] = [];

    if (history.length < 3) {
      return predictions;
    }

    // Analyze recent trends
    const recent = history.slice(0, 3);
    const qualityTrend = recent[0].codeQuality - recent[2].codeQuality;
    const securityTrend = recent[0].security - recent[2].security;

    if (qualityTrend < -10) {
      predictions.push({
        type: 'warning',
        message: 'Code quality is declining. Consider refactoring sessions.',
        confidence: 75,
        timeframe: '2-3 weeks',
        impact: 'medium'
      });
    }

    if (securityTrend < -5) {
      predictions.push({
        type: 'warning',
        message: 'Security score dropping. Review authentication and validation.',
        confidence: 80,
        timeframe: '1 week',
        impact: 'high'
      });
    }

    if (recent[0].overallScore > 85) {
      predictions.push({
        type: 'milestone',
        message: 'Project ready for production deployment!',
        confidence: 90,
        timeframe: 'now',
        impact: 'high'
      });
    }

    return predictions;
  }

  private generateRecommendations(current: ProjectHealthSnapshot, trends: ProjectHealthTrend[]): string[] {
    const recommendations: string[] = [];

    // Score-based recommendations
    if (current.codeQuality < 70) {
      recommendations.push('Focus on TypeScript type safety and component structure');
    }

    if (current.security < 75) {
      recommendations.push('Add error boundaries and input validation');
    }

    if (current.performance < 80) {
      recommendations.push('Optimize loading states and component rendering');
    }

    // Trend-based recommendations
    const decliningTrends = trends.filter(t => t.trend === 'declining');
    if (decliningTrends.length > 2) {
      recommendations.push('Schedule regular debugging sessions to maintain quality');
    }

    if (current.overallScore > 90) {
      recommendations.push('Consider advanced patterns like state management and testing');
    }

    return recommendations;
  }

  private calculateTimeToOptimal(trends: ProjectHealthTrend[]): string {
    const improvingCount = trends.filter(t => t.trend === 'improving').length;
    const decliningCount = trends.filter(t => t.trend === 'declining').length;

    if (improvingCount > decliningCount) {
      return '1-2 weeks with current progress';
    } else if (decliningCount > improvingCount) {
      return '4-6 weeks, focus needed';
    } else {
      return '2-3 weeks with consistent effort';
    }
  }
}

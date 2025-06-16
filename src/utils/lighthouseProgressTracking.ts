
export interface ProgressMetrics {
  totalRecommendations: number;
  completedRecommendations: number;
  inProgressRecommendations: number;
  pendingRecommendations: number;
  dismissedRecommendations: number;
  completionRate: number;
  totalTimeSpent: number;
  totalTimeSaved: number;
  averageImplementationTime: number;
  successRate: number;
}

export const calculateProgressMetrics = (recommendations: any[], progressData: any[]): ProgressMetrics => {
  const totalRecommendations = recommendations.length;
  const completedRecommendations = recommendations.filter(r => r.status === 'completed').length;
  const inProgressRecommendations = recommendations.filter(r => r.status === 'in_progress').length;
  const pendingRecommendations = recommendations.filter(r => r.status === 'pending').length;
  const dismissedRecommendations = recommendations.filter(r => r.status === 'dismissed').length;
  
  const completionRate = totalRecommendations > 0 ? (completedRecommendations / totalRecommendations) * 100 : 0;
  
  const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.time_spent_hours || 0), 0);
  const totalTimeSaved = recommendations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.estimated_savings_ms || 0), 0);
  
  const completedProgress = progressData.filter(p => p.new_status === 'completed');
  const averageImplementationTime = completedProgress.length > 0 
    ? completedProgress.reduce((sum, p) => sum + (p.time_spent_hours || 0), 0) / completedProgress.length
    : 0;
  
  const attemptedRecommendations = recommendations.filter(r => r.status !== 'pending').length;
  const successRate = attemptedRecommendations > 0 
    ? (completedRecommendations / attemptedRecommendations) * 100 
    : 0;
  
  return {
    totalRecommendations,
    completedRecommendations,
    inProgressRecommendations,
    pendingRecommendations,
    dismissedRecommendations,
    completionRate,
    totalTimeSpent,
    totalTimeSaved,
    averageImplementationTime,
    successRate,
  };
};

export const calculateImpactMetrics = (beforeAudit: any, afterAudit: any) => {
  if (!beforeAudit || !afterAudit) return null;
  
  const beforeScores = beforeAudit.scores || {};
  const afterScores = afterAudit.scores || {};
  
  const improvements = {
    performance: (afterScores.performance || 0) - (beforeScores.performance || 0),
    accessibility: (afterScores.accessibility || 0) - (beforeScores.accessibility || 0),
    bestPractices: (afterScores.bestPractices || 0) - (beforeScores.bestPractices || 0),
    seo: (afterScores.seo || 0) - (beforeScores.seo || 0),
    pwa: (afterScores.pwa || 0) - (beforeScores.pwa || 0),
  };
  
  const beforeMetrics = beforeAudit.metrics || {};
  const afterMetrics = afterAudit.metrics || {};
  
  const metricImprovements = {
    firstContentfulPaint: (beforeMetrics.firstContentfulPaint || 0) - (afterMetrics.firstContentfulPaint || 0),
    largestContentfulPaint: (beforeMetrics.largestContentfulPaint || 0) - (afterMetrics.largestContentfulPaint || 0),
    firstInputDelay: (beforeMetrics.firstInputDelay || 0) - (afterMetrics.firstInputDelay || 0),
    cumulativeLayoutShift: (beforeMetrics.cumulativeLayoutShift || 0) - (afterMetrics.cumulativeLayoutShift || 0),
    speedIndex: (beforeMetrics.speedIndex || 0) - (afterMetrics.speedIndex || 0),
    totalBlockingTime: (beforeMetrics.totalBlockingTime || 0) - (afterMetrics.totalBlockingTime || 0),
  };
  
  const overallImprovement = Object.values(improvements).reduce((sum, val) => sum + val, 0) / 5;
  const significantImprovements = Object.values(improvements).filter(val => val > 5).length;
  
  return {
    scoreImprovements: improvements,
    metricImprovements,
    overallImprovement,
    significantImprovements,
    hasSignificantImprovement: overallImprovement > 5,
  };
};

export const generateProgressReport = (
  projectId: string,
  recommendations: any[],
  progressData: any[],
  dateRange: { from: Date; to: Date }
) => {
  const metrics = calculateProgressMetrics(recommendations, progressData);
  
  const filteredProgress = progressData.filter(p => {
    const progressDate = new Date(p.created_at);
    return progressDate >= dateRange.from && progressDate <= dateRange.to;
  });
  
  const dailyProgress = filteredProgress.reduce((acc, p) => {
    const date = new Date(p.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { completed: 0, started: 0, dismissed: 0 };
    }
    
    if (p.new_status === 'completed') acc[date].completed++;
    if (p.new_status === 'in_progress') acc[date].started++;
    if (p.new_status === 'dismissed') acc[date].dismissed++;
    
    return acc;
  }, {} as Record<string, any>);
  
  const categoryProgress = recommendations.reduce((acc, r) => {
    if (!acc[r.category]) {
      acc[r.category] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }
    
    acc[r.category].total++;
    if (r.status === 'completed') acc[r.category].completed++;
    if (r.status === 'in_progress') acc[r.category].inProgress++;
    if (r.status === 'pending') acc[r.category].pending++;
    
    return acc;
  }, {} as Record<string, any>);
  
  const difficultyProgress = recommendations.reduce((acc, r) => {
    if (!acc[r.difficulty_level]) {
      acc[r.difficulty_level] = { total: 0, completed: 0, averageTime: 0 };
    }
    
    acc[r.difficulty_level].total++;
    if (r.status === 'completed') {
      acc[r.difficulty_level].completed++;
      const relatedProgress = progressData.filter(p => 
        p.recommendation_id === r.id && p.new_status === 'completed'
      );
      if (relatedProgress.length > 0) {
        acc[r.difficulty_level].averageTime += relatedProgress[0].time_spent_hours || 0;
      }
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  // Calculate average time for each difficulty level
  Object.keys(difficultyProgress).forEach(level => {
    const data = difficultyProgress[level];
    if (data.completed > 0) {
      data.averageTime = data.averageTime / data.completed;
    }
  });
  
  return {
    projectId,
    dateRange,
    metrics,
    dailyProgress,
    categoryProgress,
    difficultyProgress,
    topPerformingCategories: Object.entries(categoryProgress)
      .sort(([,a], [,b]) => (b as any).completed - (a as any).completed)
      .slice(0, 3)
      .map(([category]) => category),
    recommendationsToReview: recommendations.filter(r => 
      r.status === 'pending' && r.priority_score > 70
    ).length,
    automationOpportunities: recommendations.filter(r => 
      r.is_automated && r.status === 'pending'
    ).length,
  };
};

export const getProgressTrends = (progressData: any[], days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentProgress = progressData.filter(p => 
    new Date(p.created_at) >= cutoffDate
  );
  
  const trends = recentProgress.reduce((acc, p) => {
    const week = getWeekNumber(new Date(p.created_at));
    
    if (!acc[week]) {
      acc[week] = { completed: 0, started: 0, dismissed: 0, timeSpent: 0 };
    }
    
    if (p.new_status === 'completed') acc[week].completed++;
    if (p.new_status === 'in_progress') acc[week].started++;
    if (p.new_status === 'dismissed') acc[week].dismissed++;
    
    acc[week].timeSpent += p.time_spent_hours || 0;
    
    return acc;
  }, {} as Record<string, any>);
  
  const weeks = Object.keys(trends).sort();
  const velocity = weeks.length > 1 
    ? trends[weeks[weeks.length - 1]]?.completed - trends[weeks[0]]?.completed 
    : 0;
  
  return {
    weeklyTrends: trends,
    velocity,
    averageCompletionTime: recentProgress
      .filter(p => p.new_status === 'completed')
      .reduce((sum, p) => sum + (p.time_spent_hours || 0), 0) / 
      recentProgress.filter(p => p.new_status === 'completed').length || 0,
    mostActiveWeek: weeks.reduce((max, week) => 
      (trends[week]?.completed || 0) > (trends[max]?.completed || 0) ? week : max
    , weeks[0] || ''),
  };
};

function getWeekNumber(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

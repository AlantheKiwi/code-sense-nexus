
export const calculateROI = (costBenefitScore: number, estimatedHours: number, estimatedSavingsMs: number) => {
  const cost = estimatedHours * 50; // $50/hour
  const benefit = (estimatedSavingsMs / 1000) * 10; // $10/second saved
  
  if (cost === 0) return 0;
  
  const roi = ((benefit - cost) / cost) * 100;
  return Math.round(roi);
};

export const calculateBatchMetrics = (recommendations: any[]) => {
  const totalHours = recommendations.reduce((sum, r) => sum + r.estimated_time_hours, 0);
  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimated_savings_ms, 0);
  const avgPriority = recommendations.reduce((sum, r) => sum + r.priority_score, 0) / recommendations.length;
  const avgCostBenefit = recommendations.reduce((sum, r) => sum + r.cost_benefit_score, 0) / recommendations.length;
  
  const difficultyBreakdown = recommendations.reduce((acc, r) => {
    acc[r.difficulty_level] = (acc[r.difficulty_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryBreakdown = recommendations.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalRecommendations: recommendations.length,
    totalEstimatedHours: totalHours,
    totalEstimatedSavings: totalSavings,
    averagePriority: Math.round(avgPriority),
    averageCostBenefit: avgCostBenefit,
    difficultyBreakdown,
    categoryBreakdown,
    automatedCount: recommendations.filter(r => r.is_automated).length,
    estimatedCost: totalHours * 50, // $50/hour
    estimatedBenefit: (totalSavings / 1000) * 10, // $10/second
  };
};


export const validateRecommendationData = (recommendation: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!recommendation.title || recommendation.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!recommendation.description || recommendation.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!recommendation.fix_suggestion || recommendation.fix_suggestion.trim().length === 0) {
    errors.push('Fix suggestion is required');
  }
  
  if (!['easy', 'medium', 'hard'].includes(recommendation.difficulty_level)) {
    errors.push('Valid difficulty level is required');
  }
  
  if (!['performance', 'accessibility', 'best-practices', 'seo', 'pwa'].includes(recommendation.category)) {
    errors.push('Valid category is required');
  }
  
  if (recommendation.priority_score < 0 || recommendation.priority_score > 100) {
    errors.push('Priority score must be between 0 and 100');
  }
  
  if (recommendation.estimated_time_hours < 0) {
    errors.push('Estimated time must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

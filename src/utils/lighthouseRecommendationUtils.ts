
export const getRecommendationPriorityColor = (priority: number) => {
  if (priority >= 80) return 'text-red-600 bg-red-50';
  if (priority >= 60) return 'text-orange-600 bg-orange-50';
  if (priority >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

export const getRecommendationPriorityLabel = (priority: number) => {
  if (priority >= 80) return 'High';
  if (priority >= 60) return 'Medium';
  if (priority >= 40) return 'Low';
  return 'Very Low';
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'hard':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'in_progress':
      return 'text-blue-600 bg-blue-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'dismissed':
      return 'text-gray-600 bg-gray-50';
    case 'not_applicable':
      return 'text-gray-400 bg-gray-25';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const formatTimeEstimate = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`;
  } else if (hours < 8) {
    return `${hours}h`;
  } else {
    const days = Math.round(hours / 8);
    return `${days}d`;
  }
};

export const formatSavingsEstimate = (ms: number) => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }
};

export const calculateROI = (costBenefitScore: number, estimatedHours: number, estimatedSavingsMs: number) => {
  const cost = estimatedHours * 50; // $50/hour
  const benefit = (estimatedSavingsMs / 1000) * 10; // $10/second saved
  
  if (cost === 0) return 0;
  
  const roi = ((benefit - cost) / cost) * 100;
  return Math.round(roi);
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'performance':
      return '⚡';
    case 'accessibility':
      return '♿';
    case 'best-practices':
      return '✅';
    case 'seo':
      return '🔍';
    case 'pwa':
      return '📱';
    default:
      return '📊';
  }
};

export const getToolIntegrationsByCategory = () => {
  return {
    'bundling': ['webpack', 'rollup', 'vite', 'parcel'],
    'image-optimization': ['imagemin', 'sharp', 'squoosh', 'cloudinary'],
    'css-optimization': ['purgecss', 'uncss', 'cssnano', 'critical'],
    'js-optimization': ['terser', 'babel-minify', 'esbuild'],
    'cdn': ['cloudflare', 'aws-cloudfront', 'fastly'],
    'monitoring': ['lighthouse-ci', 'web-vitals', 'speedcurve'],
    'accessibility': ['axe-core', 'pa11y', 'lighthouse-accessibility'],
    'seo': ['lighthouse-seo', 'screaming-frog', 'yoast'],
  };
};

export const getRecommendationTemplatesByProjectType = (projectType: string) => {
  const templates = {
    react: [
      'Bundle Splitting',
      'Unused CSS Removal',
      'Tree Shaking',
      'Code Splitting with React.lazy',
      'Image Optimization',
    ],
    vue: [
      'Vue Bundle Analysis',
      'CSS Purging',
      'Component Lazy Loading',
      'Image Optimization',
    ],
    wordpress: [
      'Plugin Optimization',
      'Theme Performance',
      'Database Optimization',
      'Caching Implementation',
      'Image Compression',
    ],
    ecommerce: [
      'Product Image Optimization',
      'Cart Performance',
      'Checkout Optimization',
      'Search Performance',
      'Mobile Performance',
    ],
    general: [
      'Image Optimization',
      'CSS Minification',
      'JavaScript Minification',
      'Accessibility Improvements',
      'SEO Optimization',
    ],
  };

  return templates[projectType as keyof typeof templates] || templates.general;
};

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

export const sortRecommendationsByPriority = (recommendations: any[]) => {
  return [...recommendations].sort((a, b) => {
    // Primary sort: priority score (high to low)
    if (a.priority_score !== b.priority_score) {
      return b.priority_score - a.priority_score;
    }
    
    // Secondary sort: cost-benefit score (high to low)
    if (a.cost_benefit_score !== b.cost_benefit_score) {
      return b.cost_benefit_score - a.cost_benefit_score;
    }
    
    // Tertiary sort: difficulty (easy first)
    const difficultyOrder = { easy: 3, medium: 2, hard: 1 };
    const aDifficulty = difficultyOrder[a.difficulty_level as keyof typeof difficultyOrder] || 0;
    const bDifficulty = difficultyOrder[b.difficulty_level as keyof typeof difficultyOrder] || 0;
    
    return bDifficulty - aDifficulty;
  });
};

export const groupRecommendationsByCategory = (recommendations: any[]) => {
  return recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, any[]>);
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

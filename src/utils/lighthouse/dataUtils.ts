
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

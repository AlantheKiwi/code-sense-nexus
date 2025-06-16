
export const getLighthouseScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getLighthouseScoreGrade = (score: number): string => {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

export const formatLighthouseMetric = (value: number, unit: string = 'ms'): string => {
  if (unit === 'ms') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    return `${Math.round(value)}ms`;
  }
  return `${value}${unit}`;
};

export const getLighthouseMetricColor = (metricId: string, value: number): string => {
  const thresholds: { [key: string]: { good: number; poor: number } } = {
    'first-contentful-paint': { good: 1800, poor: 3000 },
    'largest-contentful-paint': { good: 2500, poor: 4000 },
    'first-input-delay': { good: 100, poor: 300 },
    'cumulative-layout-shift': { good: 0.1, poor: 0.25 },
    'speed-index': { good: 3400, poor: 5800 },
    'total-blocking-time': { good: 200, poor: 600 },
  };

  const threshold = thresholds[metricId];
  if (!threshold) return 'text-gray-600';

  if (value <= threshold.good) return 'text-green-600';
  if (value <= threshold.poor) return 'text-yellow-600';
  return 'text-red-600';
};

export const getOpportunityPriority = (savings: number): 'high' | 'medium' | 'low' => {
  if (savings > 1000) return 'high';
  if (savings > 500) return 'medium';
  return 'low';
};

export const getOpportunityPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

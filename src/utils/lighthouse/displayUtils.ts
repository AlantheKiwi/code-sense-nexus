
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

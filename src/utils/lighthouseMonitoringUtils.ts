
export const getMonitoringIntervalOptions = () => [
  { value: 'hourly', label: 'Hourly', description: 'Run every hour (excludes peak hours if configured)' },
  { value: 'daily', label: 'Daily', description: 'Run once per day at specified time' },
  { value: 'weekly', label: 'Weekly', description: 'Run once per week at specified time' },
];

export const getDefaultThresholds = () => ({
  performance: 80,
  accessibility: 80,
  bestPractices: 80,
  seo: 80,
  pwa: 70,
});

export const getAlertChannelOptions = () => [
  { value: 'email', label: 'Email', description: 'Send alerts via email' },
  { value: 'webhook', label: 'Webhook', description: 'Send alerts to webhook URL' },
  { value: 'slack', label: 'Slack', description: 'Send alerts to Slack channel' },
];

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'running':
      return 'text-blue-600 bg-blue-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'cancelled':
      return 'text-gray-600 bg-gray-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const formatRunDuration = (startedAt?: string, completedAt?: string) => {
  if (!startedAt) return 'Not started';
  if (!completedAt) return 'Running...';
  
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const durationMs = end.getTime() - start.getTime();
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const calculateOptimizedSchedule = (
  interval: 'hourly' | 'daily' | 'weekly',
  avoidPeakHours: boolean = true,
  peakStart: string = '09:00',
  peakEnd: string = '17:00'
) => {
  const now = new Date();
  
  if (interval === 'hourly' && avoidPeakHours) {
    // For hourly monitoring, suggest running during off-peak hours
    const offPeakHours = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      if (timeStr < peakStart || timeStr > peakEnd) {
        offPeakHours.push(timeStr);
      }
    }
    return {
      suggestedTimes: offPeakHours,
      recommendation: 'Running during off-peak hours to avoid high traffic periods'
    };
  }
  
  if (interval === 'daily') {
    // Suggest early morning for daily runs
    return {
      suggestedTimes: ['02:00', '03:00', '04:00', '05:00'],
      recommendation: 'Early morning hours typically have lower traffic and better performance'
    };
  }
  
  if (interval === 'weekly') {
    // Suggest weekend early morning for weekly runs
    return {
      suggestedTimes: ['02:00', '03:00', '04:00'],
      recommendation: 'Weekend early morning provides most consistent baseline measurements'
    };
  }
  
  return {
    suggestedTimes: ['02:00'],
    recommendation: 'Default off-peak time'
  };
};

export const validateMonitoringConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.urls || !Array.isArray(config.urls) || config.urls.length === 0) {
    errors.push('At least one URL is required');
  }
  
  if (config.urls) {
    for (const url of config.urls) {
      try {
        new URL(url);
      } catch {
        errors.push(`Invalid URL: ${url}`);
      }
    }
  }
  
  if (!config.schedule_interval || !['hourly', 'daily', 'weekly'].includes(config.schedule_interval)) {
    errors.push('Valid schedule interval is required');
  }
  
  if (!config.performance_thresholds) {
    errors.push('Performance thresholds are required');
  } else {
    const thresholds = config.performance_thresholds;
    for (const [metric, value] of Object.entries(thresholds)) {
      if (typeof value === 'number' && (value < 0 || value > 100)) {
        errors.push(`${metric} threshold must be between 0 and 100`);
      }
    }
  }
  
  if (config.max_audits_per_day && (config.max_audits_per_day < 1 || config.max_audits_per_day > 100)) {
    errors.push('Maximum audits per day must be between 1 and 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const estimateMonitoringCost = (config: any) => {
  const urlCount = config.urls?.length || 0;
  const dailyRuns = config.schedule_interval === 'hourly' ? 24 : 
                   config.schedule_interval === 'daily' ? 1 : 
                   1/7; // weekly
  
  const monthlyAudits = urlCount * dailyRuns * 30;
  
  // Rough cost estimate (adjust based on actual PageSpeed API pricing)
  const costPerAudit = 0.01; // $0.01 per audit (example)
  const monthlyCost = monthlyAudits * costPerAudit;
  
  return {
    monthlyAudits: Math.round(monthlyAudits),
    monthlyCost: monthlyCost.toFixed(2),
    recommendation: monthlyAudits > 1000 ? 
      'Consider reducing frequency or URL count to optimize costs' : 
      'Cost-effective monitoring configuration'
  };
};

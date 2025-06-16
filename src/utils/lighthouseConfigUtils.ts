
import { LighthouseConfiguration } from '@/hooks/useLighthouseConfigurations';

export const getDefaultLighthouseSettings = (): LighthouseConfiguration['settings'] => ({
  device: 'mobile',
  networkThrottling: '4G',
  cpuThrottling: 4,
  viewport: { width: 375, height: 667 },
  performanceBudget: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 90,
    pwa: 80,
  },
  customThresholds: {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    speedIndex: 3400,
    totalBlockingTime: 200,
  },
  authentication: {
    enabled: false,
    headers: {},
    cookies: [],
  },
});

export const validateLighthouseSettings = (settings: LighthouseConfiguration['settings']): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate device
  if (!['mobile', 'desktop', 'tablet'].includes(settings.device)) {
    errors.push('Device must be mobile, desktop, or tablet');
  }

  // Validate network throttling
  if (!['4G', '3G', '2G', 'broadband', 'offline'].includes(settings.networkThrottling)) {
    errors.push('Invalid network throttling option');
  }

  // Validate CPU throttling
  if (settings.cpuThrottling < 1 || settings.cpuThrottling > 10) {
    errors.push('CPU throttling must be between 1 and 10');
  }

  // Validate viewport
  if (!settings.viewport?.width || !settings.viewport?.height) {
    errors.push('Viewport dimensions are required');
  }

  // Validate performance budget
  if (settings.performanceBudget) {
    const budgetKeys = Object.keys(settings.performanceBudget) as Array<keyof typeof settings.performanceBudget>;
    for (const key of budgetKeys) {
      const value = settings.performanceBudget[key];
      if (value !== undefined && (value < 0 || value > 100)) {
        errors.push(`Performance budget ${key} must be between 0 and 100`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getNetworkThrottlingOptions = () => [
  { value: '4G', label: '4G (Fast)', description: 'Simulates fast 4G connection' },
  { value: '3G', label: '3G (Regular)', description: 'Simulates regular 3G connection' },
  { value: '2G', label: '2G (Slow)', description: 'Simulates slow 2G connection' },
  { value: 'broadband', label: 'Broadband', description: 'High-speed broadband connection' },
  { value: 'offline', label: 'Offline', description: 'No network connection' },
];

export const getDevicePresets = () => [
  {
    device: 'mobile',
    name: 'Mobile',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
  },
  {
    device: 'tablet',
    name: 'Tablet',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
  },
  {
    device: 'desktop',
    name: 'Desktop',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
];

export const calculateNextRunTime = (frequency: string, scheduleTime?: string): Date | null => {
  const now = new Date();
  const nextRun = new Date();

  if (scheduleTime) {
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
  }

  switch (frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      return nextRun;
    
    case 'weekly':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      return nextRun;
    
    case 'monthly':
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      return nextRun;
    
    default:
      return null;
  }
};

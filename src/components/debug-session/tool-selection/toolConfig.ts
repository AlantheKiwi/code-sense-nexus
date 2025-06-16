
import { Code, Zap, Shield, Accessibility } from 'lucide-react';
import { ToolConfig } from './types';

export const availableTools: ToolConfig[] = [
  {
    id: 'eslint',
    name: 'ESLint',
    category: 'code-quality',
    icon: Code,
    description: 'JavaScript/TypeScript code quality and style analysis',
    estimatedTime: '30s',
    status: 'available'
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    category: 'performance',
    icon: Zap,
    description: 'Web performance, accessibility, and SEO auditing',
    estimatedTime: '45s',
    status: 'available'
  },
  {
    id: 'snyk',
    name: 'Snyk',
    category: 'security',
    icon: Shield,
    description: 'Security vulnerability scanning and dependency analysis',
    estimatedTime: '60s',
    status: 'available'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    category: 'accessibility',
    icon: Accessibility,
    description: 'WCAG compliance and accessibility testing',
    estimatedTime: '25s',
    status: 'available'
  }
];

export const categoryLabels = {
  'code-quality': 'Code Quality',
  'security': 'Security',
  'performance': 'Performance',
  'accessibility': 'Accessibility'
};

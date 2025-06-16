
import { ComponentType } from 'react';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'code-quality' | 'security' | 'performance' | 'accessibility';
  icon: ComponentType<{ className?: string }>;
  description: string;
  estimatedTime: string;
  status: 'available' | 'running' | 'completed' | 'error' | 'disabled';
}

export interface ToolSelectionGridProps {
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
}

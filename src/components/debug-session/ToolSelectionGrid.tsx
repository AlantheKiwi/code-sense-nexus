import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Code, Zap, Accessibility, FileSearch, Info, ChevronDown } from 'lucide-react';
import { ToolEducationSystem } from './education/ToolEducationSystem';
import { SmartRecommendationEngine } from './recommendations/SmartRecommendationEngine';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'code-quality' | 'security' | 'performance' | 'accessibility';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  estimatedTime: string;
  status: 'available' | 'running' | 'completed' | 'error' | 'disabled';
}

interface ToolSelectionGridProps {
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
}

const availableTools: ToolConfig[] = [
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

const categoryLabels = {
  'code-quality': 'Code Quality',
  'security': 'Security',
  'performance': 'Performance',
  'accessibility': 'Accessibility'
};

const getStatusColor = (status: ToolConfig['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'running':
      return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'disabled':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const ToolSelectionGrid = ({ onAnalyze, isAnalyzing }: ToolSelectionGridProps) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(['eslint']);
  const [tools, setTools] = useState<ToolConfig[]>(availableTools);
  const [showEducation, setShowEducation] = useState(false);

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, ToolConfig[]>);

  const handleToolToggle = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool?.status === 'disabled') return;

    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSelectAll = () => {
    const availableToolIds = tools
      .filter(tool => tool.status !== 'disabled')
      .map(tool => tool.id);
    setSelectedTools(availableToolIds);
  };

  const handleDeselectAll = () => {
    setSelectedTools([]);
  };

  const calculateTotalTime = () => {
    const selectedToolConfigs = tools.filter(tool => selectedTools.includes(tool.id));
    const totalSeconds = selectedToolConfigs.reduce((acc, tool) => {
      const seconds = parseInt(tool.estimatedTime);
      return acc + (isNaN(seconds) ? 30 : seconds);
    }, 0);
    
    return totalSeconds > 60 ? `${Math.ceil(totalSeconds / 60)}m` : `${totalSeconds}s`;
  };

  const handleAnalyze = () => {
    if (selectedTools.length === 0) return;
    
    // Update tool statuses to running
    setTools(prev => prev.map(tool => 
      selectedTools.includes(tool.id) 
        ? { ...tool, status: 'running' }
        : tool
    ));
    
    onAnalyze(selectedTools);
  };

  // Reset tool statuses when analysis completes
  useEffect(() => {
    if (!isAnalyzing) {
      setTools(prev => prev.map(tool => 
        tool.status === 'running' 
          ? { ...tool, status: 'completed' }
          : tool
      ));
    }
  }, [isAnalyzing]);

  return (
    <div className="space-y-6">
      {/* Smart Recommendations */}
      <SmartRecommendationEngine
        projectId="sample-project-id" // In real app, get from context
        selectedTools={selectedTools}
        onToolSelect={handleToolToggle}
        onApplyRecommendation={(tools) => {
          setSelectedTools(tools);
        }}
      />

      {/* Existing Tool Selection Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Debugging Tool Selection
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEducation(!showEducation)}
              >
                <Info className="h-4 w-4 mr-1" />
                {showEducation ? 'Hide' : 'Show'} Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isAnalyzing}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={isAnalyzing}
              >
                Deselect All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTools.map((tool) => {
                  const IconComponent = tool.icon;
                  const isSelected = selectedTools.includes(tool.id);
                  const isDisabled = tool.status === 'disabled' || isAnalyzing;
                  
                  return (
                    <div
                      key={tool.id}
                      className={`relative p-4 border rounded-lg transition-all duration-200 ${
                        isSelected && !isDisabled
                          ? 'border-blue-300 bg-blue-50'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <IconComponent className="h-6 w-6 mt-1 text-gray-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{tool.name}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(tool.status)}`}
                              >
                                {tool.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {tool.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              Est. time: {tool.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => handleToolToggle(tool.id)}
                          disabled={isDisabled}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedTools.length > 0 && (
                <>
                  {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
                  {' • '}
                  Est. total time: {calculateTotalTime()}
                </>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={selectedTools.length === 0 || isAnalyzing}
              className="min-w-[140px]"
            >
              {isAnalyzing ? 'Analyzing...' : `Analyze with ${selectedTools.length} tool${selectedTools.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Educational System */}
      <Collapsible open={showEducation} onOpenChange={setShowEducation}>
        <CollapsibleContent>
          <ToolEducationSystem 
            selectedTools={selectedTools}
            onToolSelect={handleToolToggle}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Info } from 'lucide-react';
import { ToolEducationSystem } from './education/ToolEducationSystem';
import { SmartRecommendationEngine } from './recommendations/SmartRecommendationEngine';
import { ToolCategory } from './tool-selection/ToolCategory';
import { ToolSelectionActions } from './tool-selection/ToolSelectionActions';
import { availableTools, categoryLabels } from './tool-selection/toolConfig';
import { ToolConfig, ToolSelectionGridProps } from './tool-selection/types';

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
        projectId="sample-project-id"
        selectedTools={selectedTools}
        onToolSelect={handleToolToggle}
        onApplyRecommendation={(tools) => {
          setSelectedTools(tools);
        }}
      />

      {/* Tool Selection Grid */}
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
              <ToolSelectionActions
                selectedTools={selectedTools}
                isAnalyzing={isAnalyzing}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onAnalyze={handleAnalyze}
                calculateTotalTime={calculateTotalTime}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <ToolCategory
              key={category}
              category={category as keyof typeof categoryLabels}
              tools={categoryTools}
              selectedTools={selectedTools}
              isAnalyzing={isAnalyzing}
              onToolToggle={handleToolToggle}
            />
          ))}
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

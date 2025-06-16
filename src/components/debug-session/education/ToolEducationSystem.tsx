
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp } from 'lucide-react';
import { ToolHelpTooltips } from './ToolHelpTooltips';
import { ToolImpactExplanations } from './ToolImpactExplanations';
import { ToolExamples } from './ToolExamples';
import { ToolIntegrationGuides } from './ToolIntegrationGuides';
import { ToolSuccessMetrics } from './ToolSuccessMetrics';

interface ToolEducationSystemProps {
  selectedTools: string[];
  onToolSelect?: (toolId: string) => void;
}

export const ToolEducationSystem = ({ selectedTools, onToolSelect }: ToolEducationSystemProps) => {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tool Education System
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Beginner</span>
            <Switch
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
            <span className="text-sm text-muted-foreground">Advanced</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="integration">Setup</TabsTrigger>
            <TabsTrigger value="metrics">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ToolHelpTooltips 
              advancedMode={advancedMode}
              selectedTools={selectedTools}
              onToolSelect={onToolSelect}
            />
          </TabsContent>
          
          <TabsContent value="impact" className="space-y-4">
            <ToolImpactExplanations 
              advancedMode={advancedMode}
              selectedTools={selectedTools}
            />
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <ToolExamples 
              advancedMode={advancedMode}
              selectedTools={selectedTools}
            />
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <ToolIntegrationGuides 
              advancedMode={advancedMode}
              selectedTools={selectedTools}
            />
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <ToolSuccessMetrics 
              advancedMode={advancedMode}
              selectedTools={selectedTools}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

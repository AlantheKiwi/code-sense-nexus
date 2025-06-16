
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Target, History, Users, Bookmark } from 'lucide-react';
import { ProjectTypeDetector } from './ProjectTypeDetector';
import { SmartToolCombinations } from './SmartToolCombinations';
import { PriorityAnalysisSuggestions } from './PriorityAnalysisSuggestions';
import { QuickScanOptions } from './QuickScanOptions';
import { HistoricalAnalysisData } from './HistoricalAnalysisData';
import { PeerRecommendations } from './PeerRecommendations';
import { CustomAnalysisProfiles } from './CustomAnalysisProfiles';

interface SmartRecommendationEngineProps {
  projectId?: string;
  selectedTools: string[];
  onToolSelect: (toolId: string) => void;
  onApplyRecommendation: (tools: string[]) => void;
}

export const SmartRecommendationEngine = ({ 
  projectId, 
  selectedTools, 
  onToolSelect, 
  onApplyRecommendation 
}: SmartRecommendationEngineProps) => {
  const [activeTab, setActiveTab] = useState('smart');
  const [projectContext, setProjectContext] = useState({
    type: 'react',
    stage: 'development',
    complexity: 'medium',
    teamSize: 'small'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Analysis Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="smart">Smart</TabsTrigger>
            <TabsTrigger value="combinations">Combos</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="quick">Quick</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="smart" className="space-y-4">
            <ProjectTypeDetector 
              projectId={projectId}
              onContextUpdate={setProjectContext}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
          
          <TabsContent value="combinations" className="space-y-4">
            <SmartToolCombinations 
              selectedTools={selectedTools}
              projectContext={projectContext}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
          
          <TabsContent value="priority" className="space-y-4">
            <PriorityAnalysisSuggestions 
              projectContext={projectContext}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
          
          <TabsContent value="quick" className="space-y-4">
            <QuickScanOptions 
              projectContext={projectContext}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <HistoricalAnalysisData 
              projectId={projectId}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
          
          <TabsContent value="profiles" className="space-y-4">
            <CustomAnalysisProfiles 
              projectId={projectId}
              selectedTools={selectedTools}
              onApplyRecommendation={onApplyRecommendation}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

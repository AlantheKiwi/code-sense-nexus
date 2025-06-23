
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  BarChart, 
  Users, 
  Zap, 
  Brain,
  ChevronUp,
  ChevronDown,
  Play
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CodeEditor } from './CodeEditor';
import { AnalysisResult } from './AnalysisResult';
import { CollaboratorsList } from './CollaboratorsList';
import { SimpleAutoFixPanel } from './SimpleAutoFixPanel';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';

interface MobileDebugSessionProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
  result: any;
  collaborators: any[];
  projectId?: string;
  sessionId?: string;
}

export const MobileDebugSession: React.FC<MobileDebugSessionProps> = ({
  code,
  onCodeChange,
  onAnalyze,
  isAnalyzing,
  result,
  collaborators,
  projectId,
  sessionId
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [collapsedSections, setCollapsedSections] = useState({
    collaborators: true,
    autofix: true,
    ai: true
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-20">
      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Tools</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4 mt-4">
          <CodeEditor 
            code={code}
            onCodeChange={onCodeChange}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
          />
          
          {/* Quick Analyze Button */}
          <div className="sticky bottom-4 z-10">
            <Button 
              onClick={() => onAnalyze(['eslint', 'lighthouse'])}
              disabled={isAnalyzing}
              className="w-full h-12 text-base font-medium shadow-lg"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Quick Analyze'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-4">
          <AnalysisResult result={result} isAnalyzing={isAnalyzing} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4 mt-4">
          {/* Collapsible Collaborators */}
          <Collapsible 
            open={!collapsedSections.collaborators} 
            onOpenChange={() => toggleSection('collaborators')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Collaborators ({collaborators.length})
                    </div>
                    {collapsedSections.collaborators ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <CollaboratorsList collaborators={collaborators} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Collapsible Auto-Fix */}
          <Collapsible 
            open={!collapsedSections.autofix} 
            onOpenChange={() => toggleSection('autofix')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Auto-Fix Panel
                    </div>
                    {collapsedSections.autofix ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <SimpleAutoFixPanel 
                    projectId={projectId} 
                    sessionId={sessionId}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Collapsible AI Assistant */}
          <Collapsible 
            open={!collapsedSections.ai} 
            onOpenChange={() => toggleSection('ai')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Assistant
                    </div>
                    {collapsedSections.ai ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <AIAssistantPanel 
                    code={code}
                    filePath="debug-session.tsx"
                    projectType="lovable"
                    userTier="premium"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  );
};

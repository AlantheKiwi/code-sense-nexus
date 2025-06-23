
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveSummary } from './ExecutiveSummary';
import { PriorityActionItems } from './PriorityActionItems';
import { QuickWinsSection } from './QuickWinsSection';
import { TechnicalDebtTracker } from './TechnicalDebtTracker';
import { BeforeAfterComparisons } from './BeforeAfterComparisons';
import { ProjectManagementIntegration } from './ProjectManagementIntegration';
import { TeamNotificationSystem } from './TeamNotificationSystem';
import { BarChart, AlertTriangle } from 'lucide-react';

export interface AnalysisResults {
  id: string;
  projectId: string;
  sessionId: string;
  timestamp: string;
  overallHealthScore: number;
  toolsUsed: string[];
  issues: Issue[];
  recommendations: Recommendation[];
  metrics: ProjectMetrics;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'accessibility' | 'code_quality';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedTimeHours: number;
  businessImpact: string;
  technicalDebt: boolean;
  quickWin: boolean;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  dueDate?: string;
}

export interface Recommendation {
  id: string;
  issueId: string;
  title: string;
  description: string;
  actionSteps: string[];
  priority: number;
  estimatedImpact: string;
  toolsNeeded: string[];
}

export interface ProjectMetrics {
  codeQualityScore: number;
  securityScore: number;
  performanceScore: number;
  accessibilityScore: number;
  technicalDebtIndex: number;
  testCoverage?: number;
  buildTime?: number;
  bundleSize?: number;
}

interface ResultsSummaryDashboardProps {
  projectId: string;
  sessionId?: string;
  results?: AnalysisResults;
}

export const ResultsSummaryDashboard = ({ 
  projectId, 
  sessionId, 
  results 
}: ResultsSummaryDashboardProps) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Only show content if real results are provided
  if (!results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Results Available</h3>
          <p className="text-muted-foreground mb-4">
            Run a real analysis to see comprehensive results and recommendations.
          </p>
          <p className="text-sm text-muted-foreground">
            The dashboard will populate with actual data once analysis is completed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Results Summary & Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
              <TabsTrigger value="debt">Tech Debt</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <ExecutiveSummary results={results} />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <PriorityActionItems 
                issues={results.issues}
                recommendations={results.recommendations}
              />
            </TabsContent>

            <TabsContent value="quick-wins" className="space-y-4">
              <QuickWinsSection 
                issues={results.issues.filter(issue => issue.quickWin)}
                recommendations={results.recommendations}
              />
            </TabsContent>

            <TabsContent value="debt" className="space-y-4">
              <TechnicalDebtTracker 
                issues={results.issues.filter(issue => issue.technicalDebt)}
                metrics={results.metrics}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <BeforeAfterComparisons 
                projectId={projectId}
                currentMetrics={results.metrics}
              />
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <ProjectManagementIntegration 
                issues={results.issues}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <TeamNotificationSystem 
                results={results}
                projectId={projectId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};


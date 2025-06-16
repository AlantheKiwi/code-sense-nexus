
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutiveSummary } from './ExecutiveSummary';
import { PriorityActionItems } from './PriorityActionItems';
import { QuickWinsSection } from './QuickWinsSection';
import { TechnicalDebtTracker } from './TechnicalDebtTracker';
import { BeforeAfterComparisons } from './BeforeAfterComparisons';
import { ProjectManagementIntegration } from './ProjectManagementIntegration';
import { TeamNotificationSystem } from './TeamNotificationSystem';
import { BarChart, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

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
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(results || null);

  // Mock data for demonstration - in real implementation, this would come from hooks/API
  useEffect(() => {
    if (!analysisResults) {
      const mockResults: AnalysisResults = {
        id: '1',
        projectId,
        sessionId: sessionId || '',
        timestamp: new Date().toISOString(),
        overallHealthScore: 76,
        toolsUsed: ['eslint', 'lighthouse', 'accessibility'],
        issues: [
          {
            id: '1',
            title: 'Unused CSS rules reducing performance',
            description: 'Multiple unused CSS rules found that increase bundle size by 150KB',
            severity: 'medium',
            category: 'performance',
            impact: 'medium',
            effort: 'low',
            estimatedTimeHours: 2,
            businessImpact: 'Faster page load times can improve conversion rates by 2-3%',
            technicalDebt: true,
            quickWin: true,
            status: 'open'
          },
          {
            id: '2',
            title: 'Missing ARIA labels on interactive elements',
            description: 'Several buttons and form elements lack proper ARIA labels',
            severity: 'high',
            category: 'accessibility',
            impact: 'high',
            effort: 'low',
            estimatedTimeHours: 4,
            businessImpact: 'Improves accessibility compliance and user experience for 15% of users',
            technicalDebt: false,
            quickWin: true,
            status: 'open'
          },
          {
            id: '3',
            title: 'Potential XSS vulnerability in user input',
            description: 'User input not properly sanitized in comment system',
            severity: 'critical',
            category: 'security',
            impact: 'high',
            effort: 'medium',
            estimatedTimeHours: 8,
            businessImpact: 'Critical security risk that could compromise user data and trust',
            technicalDebt: false,
            quickWin: false,
            status: 'open'
          }
        ],
        recommendations: [
          {
            id: '1',
            issueId: '1',
            title: 'Implement CSS purging',
            description: 'Use PurgeCSS or similar tool to remove unused styles',
            actionSteps: [
              'Install PurgeCSS',
              'Configure build process',
              'Test UI components',
              'Deploy changes'
            ],
            priority: 1,
            estimatedImpact: 'Reduce bundle size by 30%',
            toolsNeeded: ['PurgeCSS', 'Webpack']
          }
        ],
        metrics: {
          codeQualityScore: 82,
          securityScore: 65,
          performanceScore: 78,
          accessibilityScore: 71,
          technicalDebtIndex: 34,
          testCoverage: 65,
          buildTime: 45,
          bundleSize: 850
        }
      };
      setAnalysisResults(mockResults);
    }
  }, [projectId, sessionId, results, analysisResults]);

  if (!analysisResults) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
          <p className="text-muted-foreground">Run an analysis to see comprehensive results and recommendations.</p>
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
              <ExecutiveSummary results={analysisResults} />
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <PriorityActionItems 
                issues={analysisResults.issues}
                recommendations={analysisResults.recommendations}
              />
            </TabsContent>

            <TabsContent value="quick-wins" className="space-y-4">
              <QuickWinsSection 
                issues={analysisResults.issues.filter(issue => issue.quickWin)}
                recommendations={analysisResults.recommendations}
              />
            </TabsContent>

            <TabsContent value="debt" className="space-y-4">
              <TechnicalDebtTracker 
                issues={analysisResults.issues.filter(issue => issue.technicalDebt)}
                metrics={analysisResults.metrics}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <BeforeAfterComparisons 
                projectId={projectId}
                currentMetrics={analysisResults.metrics}
              />
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <ProjectManagementIntegration 
                issues={analysisResults.issues}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <TeamNotificationSystem 
                results={analysisResults}
                projectId={projectId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

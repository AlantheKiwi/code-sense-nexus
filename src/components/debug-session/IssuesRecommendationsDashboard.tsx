
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IssuesSeverityDashboard } from './issues/IssuesSeverityDashboard';
import { IssueQuickCards } from './issues/IssueQuickCards';
import { IssueFilters } from './issues/IssueFilters';
import { RecommendationsPanel } from './issues/RecommendationsPanel';
import { IssueTrendCharts } from './issues/IssueTrendCharts';
import { IssueExportOptions } from './issues/IssueExportOptions';
import { AlertTriangle, TrendingUp, FileText } from 'lucide-react';

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'accessibility' | 'code_quality';
  impact: 'high' | 'medium' | 'low';
  file_path?: string;
  line_number?: number;
  rule_id?: string;
  created_at: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface Recommendation {
  id: string;
  issue_id: string;
  title: string;
  description: string;
  action_steps: string[];
  priority: number;
  estimated_effort: string;
  expected_impact: string;
  tools_needed?: string[];
  is_automated?: boolean;
}

interface IssuesRecommendationsDashboardProps {
  projectId?: string;
  sessionId?: string;
}

export const IssuesRecommendationsDashboard = ({ 
  projectId, 
  sessionId 
}: IssuesRecommendationsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Mock data with proper UUIDs - in real implementation, this would come from hooks/API
  const mockIssues: Issue[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Unused CSS rules detected',
      description: 'Multiple unused CSS rules found that increase bundle size',
      severity: 'medium',
      type: 'performance',
      impact: 'medium',
      file_path: 'src/styles/main.css',
      line_number: 45,
      rule_id: 'unused-css',
      created_at: new Date().toISOString(),
      status: 'open'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Missing alt attributes on images',
      description: 'Images without alt text reduce accessibility',
      severity: 'high',
      type: 'accessibility',
      impact: 'high',
      file_path: 'src/components/Gallery.tsx',
      line_number: 23,
      rule_id: 'img-alt',
      created_at: new Date().toISOString(),
      status: 'open'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Potential XSS vulnerability',
      description: 'Unsafe HTML rendering detected',
      severity: 'critical',
      type: 'security',
      impact: 'high',
      file_path: 'src/components/UserContent.tsx',
      line_number: 67,
      rule_id: 'xss-risk',
      created_at: new Date().toISOString(),
      status: 'open'
    }
  ];

  const mockRecommendations: Recommendation[] = [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      issue_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Implement CSS purging',
      description: 'Remove unused CSS rules to reduce bundle size',
      action_steps: [
        'Install PurgeCSS or similar tool',
        'Configure build process to remove unused styles',
        'Test UI to ensure no styles are broken'
      ],
      priority: 1,
      estimated_effort: '2-4 hours',
      expected_impact: 'Reduce bundle size by 30-50%',
      tools_needed: ['PurgeCSS', 'Webpack'],
      is_automated: true
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      issue_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Add descriptive alt text',
      description: 'Improve accessibility with proper image descriptions',
      action_steps: [
        'Audit all images in the application',
        'Add meaningful alt text to each image',
        'Consider decorative vs informative images'
      ],
      priority: 2,
      estimated_effort: '1-2 hours',
      expected_impact: 'Improve accessibility score by 15-20 points',
      is_automated: false
    }
  ];

  const filteredIssues = selectedFilters.length > 0 
    ? mockIssues.filter(issue => selectedFilters.includes(issue.type))
    : mockIssues;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issues & Recommendations Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <IssuesSeverityDashboard issues={mockIssues} />
              <div className="grid md:grid-cols-2 gap-4">
                <IssueQuickCards issues={filteredIssues.slice(0, 3)} />
                <RecommendationsPanel 
                  recommendations={mockRecommendations.slice(0, 3)} 
                  compact={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <IssueFilters 
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
              <IssueQuickCards issues={filteredIssues} />
              <IssueExportOptions issues={filteredIssues} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <RecommendationsPanel 
                recommendations={mockRecommendations}
                compact={false}
              />
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <IssueTrendCharts projectId={projectId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

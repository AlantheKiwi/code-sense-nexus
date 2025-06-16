
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Award, Users } from 'lucide-react';

interface ToolSuccessMetricsProps {
  advancedMode: boolean;
  selectedTools: string[];
}

const successData = {
  eslint: {
    name: 'ESLint',
    overallScore: 92,
    metrics: [
      { name: 'Code Quality', current: 85, target: 90, improvement: 45 },
      { name: 'Bug Reduction', current: 78, target: 85, improvement: 60 },
      { name: 'Development Speed', current: 88, target: 95, improvement: 35 },
      { name: 'Team Consistency', current: 94, target: 95, improvement: 70 }
    ],
    trendData: [
      { month: 'Jan', issues: 45, fixed: 12 },
      { month: 'Feb', issues: 38, fixed: 28 },
      { month: 'Mar', issues: 29, fixed: 35 },
      { month: 'Apr', issues: 22, fixed: 40 },
      { month: 'May', issues: 18, fixed: 42 },
      { month: 'Jun', issues: 15, fixed: 45 }
    ],
    testimonials: [
      "ESLint helped us reduce bugs by 60% in just 3 months",
      "Code reviews are much faster now with consistent style",
      "New team members can contribute immediately with clear guidelines"
    ]
  },
  lighthouse: {
    name: 'Lighthouse',
    overallScore: 88,
    metrics: [
      { name: 'Performance Score', current: 89, target: 95, improvement: 55 },
      { name: 'SEO Score', current: 92, target: 95, improvement: 40 },
      { name: 'Accessibility', current: 85, target: 90, improvement: 30 },
      { name: 'Best Practices', current: 88, target: 95, improvement: 45 }
    ],
    trendData: [
      { month: 'Jan', performance: 65, seo: 70, accessibility: 60 },
      { month: 'Feb', performance: 70, seo: 75, accessibility: 65 },
      { month: 'Mar', performance: 75, seo: 80, accessibility: 70 },
      { month: 'Apr', performance: 82, seo: 85, accessibility: 75 },
      { month: 'May', performance: 86, seo: 88, accessibility: 80 },
      { month: 'Jun', performance: 89, seo: 92, accessibility: 85 }
    ],
    testimonials: [
      "Page load times improved by 40%, conversion rates up 25%",
      "SEO ranking improved significantly within 2 months",
      "Users report much better experience on mobile devices"
    ]
  },
  snyk: {
    name: 'Snyk',
    overallScore: 95,
    metrics: [
      { name: 'Vulnerability Detection', current: 96, target: 98, improvement: 80 },
      { name: 'Compliance Score', current: 94, target: 95, improvement: 65 },
      { name: 'Risk Reduction', current: 92, target: 95, improvement: 70 },
      { name: 'Response Time', current: 88, target: 90, improvement: 50 }
    ],
    trendData: [
      { month: 'Jan', vulnerabilities: 28, fixed: 15 },
      { month: 'Feb', vulnerabilities: 22, fixed: 20 },
      { month: 'Mar', vulnerabilities: 18, fixed: 17 },
      { month: 'Apr', vulnerabilities: 12, fixed: 12 },
      { month: 'May', vulnerabilities: 8, fixed: 8 },
      { month: 'Jun', vulnerabilities: 5, fixed: 5 }
    ],
    testimonials: [
      "Zero security incidents since implementing Snyk",
      "Compliance audits are now straightforward and stress-free",
      "Early detection prevented potential data breach"
    ]
  },
  accessibility: {
    name: 'Accessibility Checker',
    overallScore: 91,
    metrics: [
      { name: 'WCAG Compliance', current: 93, target: 95, improvement: 85 },
      { name: 'User Reach', current: 88, target: 92, improvement: 25 },
      { name: 'Usability Score', current: 90, target: 95, improvement: 40 },
      { name: 'Legal Compliance', current: 95, target: 100, improvement: 90 }
    ],
    trendData: [
      { month: 'Jan', compliance: 45, usability: 50 },
      { month: 'Feb', compliance: 55, usability: 60 },
      { month: 'Mar', compliance: 68, usability: 70 },
      { month: 'Apr', compliance: 78, usability: 80 },
      { month: 'May', compliance: 87, usability: 85 },
      { month: 'Jun', compliance: 93, usability: 90 }
    ],
    testimonials: [
      "Expanded our user base by 20% with inclusive design",
      "Avoided potential ADA compliance lawsuits",
      "Customer satisfaction scores increased across all demographics"
    ]
  }
};

export const ToolSuccessMetrics = ({ advancedMode, selectedTools }: ToolSuccessMetricsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Success Stories & Results</h3>
        <p className="text-muted-foreground">
          {advancedMode 
            ? 'Comprehensive analytics, trends, and success metrics from real implementations'
            : 'See the results other teams have achieved with these tools'
          }
        </p>
      </div>

      {selectedTools.length > 0 ? (
        <div className="space-y-8">
          {selectedTools.map(toolId => {
            const data = successData[toolId as keyof typeof successData];
            if (!data) return null;

            return (
              <Card key={toolId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {data.name} Success Metrics
                    </CardTitle>
                    <Badge variant="outline" className={getScoreColor(data.overallScore)}>
                      {data.overallScore}% Success Rate
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Key Performance Indicators
                    </h4>
                    <div className="grid gap-4">
                      {data.metrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {metric.current}% / {metric.target}%
                              </span>
                              <Badge variant="outline" className="text-xs">
                                +{metric.improvement}%
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={(metric.current / metric.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend Chart */}
                  {advancedMode && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Improvement Trends
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          {toolId === 'eslint' || toolId === 'snyk' ? (
                            <BarChart data={data.trendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Bar 
                                dataKey={toolId === 'eslint' ? 'fixed' : 'fixed'} 
                                fill="#10b981" 
                                name="Fixed Issues"
                              />
                              <Bar 
                                dataKey={toolId === 'eslint' ? 'issues' : 'vulnerabilities'} 
                                fill="#f59e0b" 
                                name={toolId === 'eslint' ? 'New Issues' : 'New Vulnerabilities'}
                              />
                            </BarChart>
                          ) : (
                            <LineChart data={data.trendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey={Object.keys(data.trendData[0]).filter(key => key !== 'month')[0]} 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                              />
                              {Object.keys(data.trendData[0]).filter(key => key !== 'month').slice(1).map((key, index) => (
                                <Line 
                                  key={key}
                                  type="monotone" 
                                  dataKey={key} 
                                  stroke={index === 0 ? '#10b981' : '#f59e0b'} 
                                  strokeWidth={2}
                                />
                              ))}
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Success Stories */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Success Stories
                    </h4>
                    <div className="space-y-3">
                      {data.testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                          <p className="text-sm text-green-800">"{testimonial}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Tools to See Results</h3>
            <p className="text-muted-foreground">
              Choose analysis tools from the Overview tab to see success metrics and case studies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

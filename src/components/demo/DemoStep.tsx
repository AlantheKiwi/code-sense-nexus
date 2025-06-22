import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { CodeComparison } from './CodeComparison';
import { ReportToggle } from '@/components/reports/ReportToggle';

interface DemoStepProps {
  step: {
    title: string;
    description: string;
    readingTime: string;
    type: string;
    content: any;
  };
}

export const DemoStep: React.FC<DemoStepProps> = ({ step }) => {
  return (
    <Card className="min-h-[600px]">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-lg">{step.description}</p>
        </div>

        {step.type === 'code' && (
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                <code>{step.content.code}</code>
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              {step.content.issues.map((issue: string, index: number) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {issue}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step.type === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {step.content.analysisSteps.map((analysisStep: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {analysisStep.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{analysisStep.time}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{step.content.criticalIssues}</div>
                <div className="text-sm text-red-600">Critical Issues</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{step.content.suggestions}</div>
                <div className="text-sm text-yellow-600">Suggestions</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{step.content.totalIssues}</div>
                <div className="text-sm text-blue-600">Total Issues</div>
              </div>
            </div>
          </div>
        )}

        {step.type === 'issues' && (
          <div className="space-y-4">
            {step.content.issues.map((issue: any, index: number) => (
              <Card key={index} className={`border-l-4 ${
                issue.severity === 'critical' ? 'border-l-red-500' : 
                issue.severity === 'high' ? 'border-l-orange-500' : 'border-l-yellow-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      issue.severity === 'critical' ? 'text-red-500' : 
                      issue.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{issue.title}</h4>
                      <p className="text-muted-foreground mb-2">{issue.explanation}</p>
                      <Badge variant="outline">Impact: {issue.impact}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step.type === 'fixed-code' && (
          <div className="space-y-6">
            <CodeComparison 
              originalCode={step.content.originalCode}
              fixedCode={step.content.fixedCode}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {step.content.improvements.map((improvement: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{improvement}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <ReportToggle
                originalCode={step.content.originalCode}
                fixedCode={step.content.fixedCode}
                projectName="Demo Project"
                improvements={[
                  {
                    id: '1',
                    title: 'Optimized API Calls',
                    category: 'Performance',
                    originalCode: step.content.originalCode,
                    fixedCode: step.content.fixedCode,
                    impact: 'High - 67% faster loading',
                    explanation: 'Combined multiple API calls into a single optimized query'
                  }
                ]}
              />
            </div>
          </div>
        )}

        {step.type === 'results' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {step.content.metrics.map((metric: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">{metric.label}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Before</span>
                    <span className="font-mono text-red-600">{metric.before}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">After</span>
                    <span className="font-mono text-green-600">{metric.after}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">{metric.improvement} better</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

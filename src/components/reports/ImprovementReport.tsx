
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield, 
  Zap, 
  FileCode,
  Download,
  Share,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { CodeComparison } from '@/components/demo/CodeComparison';

interface ImprovementMetrics {
  performance: {
    loadingTimeBefore: string;
    loadingTimeAfter: string;
    improvement: string;
  };
  apiCalls: {
    before: number;
    after: number;
    reduction: string;
  };
  bundleSize: {
    before: string;
    after: string;
    reduction: string;
  };
  qualityScore: {
    before: number;
    after: number;
    improvement: number;
  };
}

interface BusinessImpact {
  timeSaved: string;
  costReduction: string;
  riskMitigation: string;
  userExperience: string;
}

interface CodeImprovement {
  id: string;
  title: string;
  category: string;
  originalCode: string;
  fixedCode: string;
  impact: string;
  explanation: string;
}

interface ImprovementReportProps {
  projectName: string;
  analysisDate: string;
  metrics: ImprovementMetrics;
  businessImpact: BusinessImpact;
  improvements: CodeImprovement[];
  onExportPDF?: () => void;
  onShare?: () => void;
}

export const ImprovementReport: React.FC<ImprovementReportProps> = ({
  projectName,
  analysisDate,
  metrics,
  businessImpact,
  improvements,
  onExportPDF,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState('executive');

  const overallImprovement = Math.round(
    (metrics.qualityScore.improvement + 
     parseInt(metrics.performance.improvement) + 
     parseInt(metrics.apiCalls.reduction)) / 3
  );

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">
                Code Improvement Impact Report
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {projectName} • {analysisDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                {overallImprovement}% Overall Improvement
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onExportPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share Report
        </Button>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Impact</TabsTrigger>
          <TabsTrigger value="business">Business Value</TabsTrigger>
        </TabsList>

        {/* Executive Summary Tab */}
        <TabsContent value="executive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Key Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.performance.improvement}
                  </div>
                  <div className="text-sm text-green-700">Faster Loading</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.apiCalls.reduction}
                  </div>
                  <div className="text-sm text-blue-700">Fewer API Calls</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.bundleSize.reduction}
                  </div>
                  <div className="text-sm text-purple-700">Smaller Bundle</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {improvements.length}
                  </div>
                  <div className="text-sm text-orange-700">Issues Fixed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Score Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Before</span>
                  <span className="font-mono text-red-600">{metrics.qualityScore.before}/100</span>
                </div>
                <Progress value={metrics.qualityScore.before} className="h-2" />
                <div className="flex items-center justify-between">
                  <span>After</span>
                  <span className="font-mono text-green-600">{metrics.qualityScore.after}/100</span>
                </div>
                <Progress value={metrics.qualityScore.after} className="h-2" />
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800">
                    +{metrics.qualityScore.improvement} points improvement
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Analysis Tab */}
        <TabsContent value="technical" className="space-y-6">
          {improvements.map((improvement) => (
            <Card key={improvement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{improvement.title}</CardTitle>
                  <Badge variant="outline">{improvement.category}</Badge>
                </div>
                <p className="text-gray-600">{improvement.explanation}</p>
              </CardHeader>
              <CardContent>
                <CodeComparison
                  originalCode={improvement.originalCode}
                  fixedCode={improvement.fixedCode}
                />
                <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Impact: {improvement.impact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Performance Impact Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Loading Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Before</span>
                    <span className="font-mono text-red-600">{metrics.performance.loadingTimeBefore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">After</span>
                    <span className="font-mono text-green-600">{metrics.performance.loadingTimeAfter}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">
                      {metrics.performance.improvement} faster
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-500" />
                  API Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Calls Before</span>
                    <span className="font-mono text-red-600">{metrics.apiCalls.before}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Calls After</span>
                    <span className="font-mono text-green-600">{metrics.apiCalls.after}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">
                      {metrics.apiCalls.reduction} reduction
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bundle Size Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">{metrics.bundleSize.before}</div>
                  <div className="text-sm text-gray-600">Before</div>
                </div>
                <div className="flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{metrics.bundleSize.after}</div>
                  <div className="text-sm text-gray-600">After</div>
                </div>
              </div>
              <div className="text-center mt-4">
                <Badge className="bg-green-100 text-green-800">
                  {metrics.bundleSize.reduction} smaller bundle
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Value Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Development Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {businessImpact.timeSaved}
                </div>
                <p className="text-gray-600">
                  Reduced debugging and maintenance time through proactive issue detection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Cost Reduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {businessImpact.costReduction}
                </div>
                <p className="text-gray-600">
                  Lower infrastructure costs and reduced developer hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Risk Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {businessImpact.riskMitigation}
                </div>
                <p className="text-gray-600">
                  Reduced production issues and improved code reliability
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  User Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {businessImpact.userExperience}
                </div>
                <p className="text-gray-600">
                  Faster loading times and improved application responsiveness
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Continue regular code analysis to maintain quality standards</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Implement automated testing for critical code paths</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Consider upgrading to premium for advanced optimization features</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Share, Settings } from 'lucide-react';
import { ImprovementReport } from './ImprovementReport';
import { CodeAnalysisReporter } from '@/services/reports/CodeAnalysisReporter';
import { toast } from 'sonner';

interface ReportToggleProps {
  originalCode: string;
  fixedCode: string;
  projectName: string;
  improvements: Array<{
    id: string;
    title: string;
    category: string;
    originalCode: string;
    fixedCode: string;
    impact: string;
    explanation: string;
  }>;
}

export const ReportToggle: React.FC<ReportToggleProps> = ({
  originalCode,
  fixedCode,
  projectName,
  improvements
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = () => {
    const reporter = new CodeAnalysisReporter();
    const changes = improvements.map(imp => ({
      file: 'component.tsx',
      type: 'modification' as const,
      linesChanged: imp.originalCode.split('\n').length,
      impact: 'high' as const,
      category: imp.category
    }));

    const calculation = reporter.calculateImprovements(originalCode, fixedCode, changes);
    
    const metrics = {
      performance: {
        loadingTimeBefore: `${calculation.before.performance.loadingTime}ms`,
        loadingTimeAfter: `${calculation.after.performance.loadingTime}ms`,
        improvement: `${Math.round(((calculation.before.performance.loadingTime - calculation.after.performance.loadingTime) / calculation.before.performance.loadingTime) * 100)}%`
      },
      apiCalls: {
        before: calculation.before.performance.apiCalls,
        after: calculation.after.performance.apiCalls,
        reduction: `${Math.round(((calculation.before.performance.apiCalls - calculation.after.performance.apiCalls) / calculation.before.performance.apiCalls) * 100)}%`
      },
      bundleSize: {
        before: `${Math.round(calculation.before.performance.bundleSize / 1024)}KB`,
        after: `${Math.round(calculation.after.performance.bundleSize / 1024)}KB`,
        reduction: `${Math.round(((calculation.before.performance.bundleSize - calculation.after.performance.bundleSize) / calculation.before.performance.bundleSize) * 100)}%`
      },
      qualityScore: {
        before: Math.round(calculation.before.quality.overallScore),
        after: Math.round(calculation.after.quality.overallScore),
        improvement: Math.round(calculation.after.quality.overallScore - calculation.before.quality.overallScore)
      }
    };

    setReportData({
      metrics,
      businessImpact: calculation.businessValue,
      improvements,
      analysisDate: new Date().toLocaleDateString()
    });

    setIsReportOpen(true);
  };

  const handleExportPDF = () => {
    toast.success('PDF export feature coming soon!');
  };

  const handleShare = () => {
    toast.success('Report sharing feature coming soon!');
  };

  return (
    <>
      <Button 
        onClick={generateReport}
        className="flex items-center gap-2"
        variant="outline"
      >
        <FileText className="h-4 w-4" />
        Generate Impact Report
      </Button>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Code Improvement Impact Report</DialogTitle>
          </DialogHeader>
          {reportData && (
            <ImprovementReport
              projectName={projectName}
              analysisDate={reportData.analysisDate}
              metrics={reportData.metrics}
              businessImpact={reportData.businessImpact}
              improvements={reportData.improvements}
              onExportPDF={handleExportPDF}
              onShare={handleShare}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

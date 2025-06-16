
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mail, FileSpreadsheet } from 'lucide-react';
import type { Issue } from '../IssuesRecommendationsDashboard';

interface IssueExportOptionsProps {
  issues: Issue[];
}

export const IssueExportOptions = ({ issues }: IssueExportOptionsProps) => {
  const handleExportPDF = () => {
    // Mock PDF export - in real implementation, this would generate and download a PDF
    console.log('Exporting to PDF:', issues);
    // Would use a library like jsPDF or call an API endpoint
  };

  const handleExportCSV = () => {
    // Mock CSV export - in real implementation, this would generate and download a CSV
    const csvContent = [
      ['Title', 'Severity', 'Type', 'Impact', 'File', 'Status'],
      ...issues.map(issue => [
        issue.title,
        issue.severity,
        issue.type,
        issue.impact,
        issue.file_path || '',
        issue.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issues-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    // Mock email summary - in real implementation, this would send an email
    console.log('Sending email summary for:', issues);
    alert('Email summary sent! (This is a demo)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF Report
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleEmailSummary}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Summary
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          <p>Export includes {issues.length} issues with detailed information about severity, impact, and recommendations.</p>
        </div>
      </CardContent>
    </Card>
  );
};

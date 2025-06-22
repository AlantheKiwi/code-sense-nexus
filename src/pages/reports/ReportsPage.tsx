
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Download,
  Search,
  Filter,
  Plus,
  Eye
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ReportSummary {
  id: string;
  projectName: string;
  date: string;
  overallImprovement: number;
  performanceGain: string;
  qualityScore: {
    before: number;
    after: number;
  };
  status: 'completed' | 'in-progress' | 'scheduled';
}

const ReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for demonstration
  const reports: ReportSummary[] = [
    {
      id: '1',
      projectName: 'E-commerce Dashboard',
      date: '2024-06-20',
      overallImprovement: 67,
      performanceGain: '1.6s faster',
      qualityScore: { before: 72, after: 89 },
      status: 'completed'
    },
    {
      id: '2',
      projectName: 'User Management System',
      date: '2024-06-18',
      overallImprovement: 45,
      performanceGain: '0.8s faster',
      qualityScore: { before: 65, after: 78 },
      status: 'completed'
    },
    {
      id: '3',
      projectName: 'Analytics Portal',
      date: '2024-06-15',
      overallImprovement: 83,
      performanceGain: '2.1s faster',
      qualityScore: { before: 58, after: 91 },
      status: 'completed'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const averageImprovement = Math.round(
    reports.reduce((sum, report) => sum + report.overallImprovement, 0) / reports.length
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Impact Reports</h1>
            <p className="text-gray-600">
              Track your code improvements and their business impact over time
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{reports.length}</div>
                    <div className="text-gray-600">Total Reports</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averageImprovement}%</div>
                    <div className="text-gray-600">Average Improvement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">This Month</div>
                    <div className="text-gray-600">{reports.length} Reports Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter('completed')}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={selectedFilter === 'in-progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter('in-progress')}
                    >
                      In Progress
                    </Button>
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{report.projectName}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.date}
                        </span>
                        <span>Performance: {report.performanceGain}</span>
                        <span>Quality: {report.qualityScore.before} → {report.qualityScore.after}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {report.overallImprovement}%
                        </div>
                        <div className="text-xs text-gray-600">Improvement</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Generate your first impact report to see improvements over time'
                  }
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportsPage;

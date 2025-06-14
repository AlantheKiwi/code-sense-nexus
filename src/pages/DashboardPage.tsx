
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, History, PlusCircle, ExternalLink, FileCode, Sparkles, Code, Bug, TestTube, Github, CheckCircle2, AlertCircle, Rocket } from "lucide-react";
import { useProjectsData } from '@/hooks/useProjectsData';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const chartData = [
  { severity: "Critical", issues: 3, fill: "var(--color-critical)" },
  { severity: "High", issues: 8, fill: "var(--color-high)" },
  { severity: "Medium", issues: 12, fill: "var(--color-medium)" },
  { severity: "Low", issues: 25, fill: "var(--color-low)" },
];

const chartConfig = {
  issues: {
    label: "Issues",
  },
  critical: {
    label: "Critical",
    color: "hsl(var(--destructive))",
  },
  high: {
    label: "High",
    color: "#fb923c", // orange-400
  },
  medium: {
    label: "Medium",
    color: "#facc15", // yellow-400
  },
  low: {
    label: "Low",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

const DashboardPage = () => {
  const { user, partner, isLoading: isAuthLoading } = useAuth();
  const { data: projects, isLoading: areProjectsLoading } = useProjectsData(partner?.id);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const recentActivities = [
    {
      id: 1,
      icon: <Github className="h-5 w-5 text-muted-foreground" />,
      description: 'Commit "feat: add new dashboard cards" analyzed.',
      time: '15m ago',
    },
    {
      id: 2,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      description: 'PR #42 approved with a health score of 92%.',
      time: '1h ago',
    },
    {
      id: 3,
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      description: 'Complexity of DashboardPage.tsx increased by 25%.',
      time: '3h ago',
    },
    {
      id: 4,
      icon: <Rocket className="h-5 w-5 text-brand" />,
      description: 'Project "DataSync" successfully deployed to Vercel.',
      time: 'Yesterday',
    },
  ];

  const isLoading = isAuthLoading || areProjectsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {partner ? `${partner.company_name} Dashboard` : 'Dashboard'}
          </h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome/Info Card */}
            <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader>
                    <CardTitle>Welcome, {user?.email || 'Partner'}!</CardTitle>
                    <CardDescription>
                        {partner 
                            ? `You are managing projects for ${partner.company_name}.`
                            : "Your partner account is ready. Let's get started!"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is your central hub for managing projects, analyzing code, and optimizing performance for your clients.</p>
                </CardContent>
            </Card>

            {/* Projects Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Your Projects</CardTitle>
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {projects && projects.length > 0 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {projects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted">
                                        <div>
                                            <p className="font-semibold">{project.name}</p>
                                            {project.github_url && (
                                                <a 
                                                    href={project.github_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-brand hover:underline flex items-center"
                                                >
                                                    View on GitHub <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Analyze
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-2" onClick={() => setIsAddProjectDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-4">You have no projects yet.</p>
                            <Button onClick={() => setIsAddProjectDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Overview Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Analysis Overview</CardTitle>
                    <FileCode className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="severity"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="issues" radius={4}>
                                {chartData.map((entry) => (
                                    <Cell key={entry.severity} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">AI Insights</CardTitle>
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-semibold text-primary">Proactive Alert</p>
                            <p className="text-muted-foreground">
                                Project "ClientHub" shows a 75% probability of performance degradation in the next sprint based on recent commit complexity.
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-primary">Automated Suggestion</p>
                            <p className="text-muted-foreground">
                                Generate an automated fix for 3 high-frequency, low-severity errors in "DataSync". 
                            </p>
                            <Button variant="link" size="sm" className="p-0 h-auto -mt-1" onClick={() => toast.info("Automated fix generation is coming soon!")}>
                                Generate Fix with AI
                            </Button>
                        </div>
                         <div>
                            <p className="font-semibold text-primary">Business Opportunity</p>
                            <p className="text-muted-foreground">
                               "Innovate Corp" is a good candidate for your "Performance Optimization" package.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Feed Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                    <History className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {recentActivities.length > 0 ? (
                        <div className="space-y-6">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-0.5">{activity.icon}</div>
                                    <div>
                                        <p className="text-sm text-primary leading-tight">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No recent activity to display.</p>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => toast.info("ESLint analysis feature is coming soon!")}>
                            <Code className="mr-2 h-4 w-4" /> Run ESLint Analysis
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analyze your code for syntax errors and style issues.</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => toast.info("Snyk security scan feature is coming soon!")}>
                            <Bug className="mr-2 h-4 w-4" /> Scan with Snyk
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Scans your project dependencies for known security vulnerabilities.</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => toast.info("Lighthouse audit feature is coming soon!")}>
                            <TestTube className="mr-2 h-4 w-4" /> Audit with Lighthouse
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Audits your application for performance, accessibility, and SEO.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
      {partner && (
        <AddProjectDialog 
            partnerId={partner.id}
            isOpen={isAddProjectDialogOpen}
            onOpenChange={setIsAddProjectDialogOpen}
        />
      )}
    </div>
  );
};

export default DashboardPage;

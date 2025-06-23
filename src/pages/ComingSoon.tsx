
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Zap, 
  CheckCircle, 
  Rocket, 
  Brain, 
  GitBranch,
  Bell,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Tool {
  id: string;
  name: string;
  description: string;
  useCase: string;
  icon: React.ComponentType<any>;
  progress: number;
  estimatedLaunch: string;
  status: 'In Development' | 'Beta Testing' | 'Coming Soon';
  votes: number;
}

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [votes, setVotes] = useState<Record<string, number>>({});

  const upcomingTools: Tool[] = [
    {
      id: 'security-auditor',
      name: 'Security Auditor',
      description: 'Find vulnerabilities before hackers do',
      useCase: 'Scan your Lovable project for security issues, outdated dependencies, and potential attack vectors',
      icon: Shield,
      progress: 75,
      estimatedLaunch: 'February 2025',
      status: 'Beta Testing',
      votes: 247
    },
    {
      id: 'performance-optimizer',
      name: 'Performance Optimizer',
      description: 'Make your Lovable app lightning fast',
      useCase: 'Optimize bundle size, improve loading times, and boost Core Web Vitals scores',
      icon: Zap,
      progress: 60,
      estimatedLaunch: 'March 2025',
      status: 'In Development',
      votes: 189
    },
    {
      id: 'code-quality-checker',
      name: 'Code Quality Checker',
      description: 'Professional-grade code analysis',
      useCase: 'Detect code smells, enforce best practices, and improve maintainability',
      icon: CheckCircle,
      progress: 45,
      estimatedLaunch: 'April 2025',
      status: 'In Development',
      votes: 156
    },
    {
      id: 'deployment-checker',
      name: 'Deployment Checker',
      description: 'Ensure your project is ready to launch',
      useCase: 'Pre-deployment validation, environment checks, and launch readiness assessment',
      icon: Rocket,
      progress: 30,
      estimatedLaunch: 'May 2025',
      status: 'Coming Soon',
      votes: 203
    },
    {
      id: 'ai-code-assistant',
      name: 'AI Code Assistant',
      description: 'Get intelligent coding help powered by GPT-4',
      useCase: 'Smart code suggestions, bug fixes, and feature implementation assistance',
      icon: Brain,
      progress: 85,
      estimatedLaunch: 'January 2025',
      status: 'Beta Testing',
      votes: 312
    },
    {
      id: 'github-scanner',
      name: 'GitHub Repository Scanner',
      description: 'Full codebase security and quality audit',
      useCase: 'Connect your GitHub repo for comprehensive analysis and continuous monitoring',
      icon: GitBranch,
      progress: 20,
      estimatedLaunch: 'June 2025',
      status: 'Coming Soon',
      votes: 134
    }
  ];

  const handleNotifyMe = (toolId: string) => {
    if (selectedTools.has(toolId)) {
      setSelectedTools(prev => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
      toast.success('Removed from notifications');
    } else {
      setSelectedTools(prev => new Set(prev).add(toolId));
      toast.success('Added to notifications!');
    }
  };

  const handleVote = (toolId: string) => {
    setVotes(prev => ({
      ...prev,
      [toolId]: (prev[toolId] || 0) + 1
    }));
    toast.success('Vote recorded! Thanks for your feedback.');
  };

  const handleEmailSignup = () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success('Thanks! We\'ll keep you updated on all new tools.');
    setEmail('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Beta Testing': return 'bg-green-100 text-green-800';
      case 'In Development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedTools = [...upcomingTools].sort((a, b) => {
    const aVotes = a.votes + (votes[a.id] || 0);
    const bVotes = b.votes + (votes[b.id] || 0);
    return bVotes - aVotes;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What's Coming Next
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're building a complete toolkit for Lovable developers. Vote for the tools you want most and get early access when they launch.
            </p>
            
            {/* Email Signup */}
            <Card className="max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleEmailSignup} className="bg-blue-600 hover:bg-blue-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Get Updates
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Get notified when new tools launch
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sortedTools.map((tool) => {
              const Icon = tool.icon;
              const totalVotes = tool.votes + (votes[tool.id] || 0);
              const isSelected = selectedTools.has(tool.id);
              
              return (
                <Card key={tool.id} className={`h-full transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge className={`text-xs mt-1 ${getStatusColor(tool.status)}`}>
                            {tool.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 font-medium mb-2">{tool.description}</p>
                    <p className="text-sm text-gray-500">{tool.useCase}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Development Progress</span>
                        <span className="font-medium">{tool.progress}%</span>
                      </div>
                      <Progress value={tool.progress} className="h-2" />
                    </div>

                    {/* Launch Date */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Est. Launch: {tool.estimatedLaunch}</span>
                    </div>

                    {/* Voting */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{totalVotes} votes</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(tool.id)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Vote
                      </Button>
                    </div>

                    {/* Notify Me Button */}
                    <Button
                      onClick={() => handleNotifyMe(tool.id)}
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {isSelected ? 'Notifications On' : 'Notify Me'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Community Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Help Shape the Future
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Your votes and feedback directly influence which tools we build next. Join our community of Lovable developers and help us create the perfect debugging toolkit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Join Our Discord
                </Button>
                <Button variant="outline" size="lg">
                  Follow Development Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoon;

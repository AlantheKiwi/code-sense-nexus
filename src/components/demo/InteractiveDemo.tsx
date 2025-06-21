
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const demoSteps = [
  {
    title: "Problematic Lovable Component",
    description: "Here's a typical React component with common issues that slow down development",
    type: "code",
    content: {
      code: `import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Multiple API calls without optimization
    fetchUser();
    fetchPosts();
    fetchUserStats();
  }, [userId]);

  const fetchUser = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    setUser(data[0]);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId);
    setPosts(data);
    setLoading(false);
  };

  // Missing error handling, inefficient renders
  return (
    <div style={{padding: '20px'}}>
      {loading ? <div>Loading...</div> : (
        <div>
          <h1>{user?.name}</h1>
          {posts.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};`,
      issues: [
        "Multiple unnecessary API calls",
        "Missing error handling",
        "Inefficient state management",
        "Inline styles instead of Tailwind",
        "No loading states for individual operations"
      ]
    }
  },
  {
    title: "CodeSense Analysis in Progress",
    description: "Our AI analyzes your code for 50+ types of issues specific to Lovable projects",
    type: "analysis",
    content: {
      analysisSteps: [
        { name: "Component Structure", status: "complete", time: "0.2s" },
        { name: "Supabase Integration", status: "complete", time: "0.4s" },
        { name: "Performance Patterns", status: "complete", time: "0.3s" },
        { name: "Error Handling", status: "complete", time: "0.1s" },
        { name: "Tailwind Usage", status: "complete", time: "0.2s" },
        { name: "React Best Practices", status: "complete", time: "0.3s" }
      ],
      totalIssues: 8,
      criticalIssues: 2,
      suggestions: 6
    }
  },
  {
    title: "Issues Detected",
    description: "Clear explanations in plain English - no confusing technical jargon",
    type: "issues",
    content: {
      issues: [
        {
          severity: "critical",
          title: "Multiple Unnecessary API Calls",
          explanation: "Your component makes 3 separate database calls when it could make just 1. This slows down your app and wastes Supabase credits.",
          impact: "3x slower loading, higher costs"
        },
        {
          severity: "high", 
          title: "Missing Error Handling",
          explanation: "If your database call fails, users will see a broken page. Always handle errors gracefully.",
          impact: "Poor user experience"
        },
        {
          severity: "medium",
          title: "Inline Styles vs Tailwind",
          explanation: "You're using inline styles instead of Tailwind classes. This makes your code harder to maintain and less consistent.",
          impact: "Harder to maintain"
        }
      ]
    }
  },
  {
    title: "Fixed Code",
    description: "See exactly how to fix each issue with step-by-step code improvements",
    type: "fixed-code",
    content: {
      code: `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const UserProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      // Single optimized query with joins
      const { data, error } = await supabase
        .from('users')
        .select(\`
          *,
          posts(*),
          user_stats(*)
        \`)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load user profile. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data?.posts?.map((post) => (
              <Card key={post.id} className="p-4">
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="text-muted-foreground">{post.content}</p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};`,
      improvements: [
        "Combined 3 API calls into 1 optimized query",
        "Added proper TypeScript types",
        "Implemented error handling with user-friendly messages",
        "Used Tailwind classes for consistent styling",
        "Added loading skeletons for better UX",
        "Used React Query for efficient data fetching"
      ]
    }
  },
  {
    title: "Performance Results",
    description: "Measurable improvements in your app's speed and maintainability",
    type: "results",
    content: {
      metrics: [
        { label: "Loading Time", before: "2.4s", after: "0.8s", improvement: "67%" },
        { label: "API Calls", before: "3", after: "1", improvement: "67%" },
        { label: "Bundle Size", before: "15.2KB", after: "12.1KB", improvement: "20%" },
        { label: "Maintainability Score", before: "C", after: "A", improvement: "+" }
      ]
    }
  }
];

export const InteractiveDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const playDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep(step => {
        if (step >= demoSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return step;
        }
        return step + 1;
      });
    }, 3000);
  };

  const step = demoSteps[currentStep];
  const progress = ((currentStep + 1) / demoSteps.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Demo Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={playDemo}
            disabled={isPlaying}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isPlaying ? 'Playing...' : 'Play Demo'}
          </Button>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {demoSteps.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevStep}
            disabled={currentStep === 0 || isPlaying}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextStep}
            disabled={currentStep === demoSteps.length - 1 || isPlaying}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Demo Content */}
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
                {step.content.issues.map((issue, index) => (
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
                {step.content.analysisSteps.map((analysisStep, index) => (
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
              {step.content.issues.map((issue, index) => (
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
            <div className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{step.content.code}</code>
                </pre>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {step.content.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.type === 'results' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {step.content.metrics.map((metric, index) => (
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

      {/* Call to Action */}
      {currentStep === demoSteps.length - 1 && (
        <div className="mt-8 text-center">
          <Card className="p-6 bg-brand-light">
            <h3 className="text-xl font-bold mb-2">Ready to optimize your Lovable projects?</h3>
            <p className="text-muted-foreground mb-4">Start debugging smarter, not harder</p>
            <Button size="lg" className="bg-brand hover:bg-brand/90">
              Get Started Free
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

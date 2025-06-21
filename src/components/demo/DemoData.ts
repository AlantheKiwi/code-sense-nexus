
export const demoSteps = [
  {
    title: "Problematic Lovable Component",
    description: "Here's a typical React component with common issues that slow down development",
    readingTime: "2 min read",
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
    readingTime: "1 min read",
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
    readingTime: "3 min read",
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
    readingTime: "4 min read",
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
    readingTime: "2 min read",
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

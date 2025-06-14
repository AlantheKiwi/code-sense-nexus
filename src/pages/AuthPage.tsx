
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { signInWithEmailPassword, signUpWithEmailPassword, signInWithEmail, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | 'magicLink'>('signIn');

  useEffect(() => {
    console.log(`AuthPage: isLoading state received: ${isLoading}`);
  }, [isLoading]);

  useEffect(() => {
    if (session) {
      console.log("AuthPage: Session detected, navigating to /dashboard");
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (session) {
    console.log("AuthPage: Session exists, returning null to prevent render while redirecting.");
    return null; 
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthPage: handleSignInSubmit called with email:", email);
    await signInWithEmailPassword(email, password);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthPage: handleSignUpSubmit called with email:", email, "companyName:", companyName);
    if (!companyName) {
        alert("Company name is required for sign up.");
        // Consider using a toast for consistency: toast.error("Company name is required for sign up.");
        return;
    }
    await signUpWithEmailPassword(email, password, companyName);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthPage: handleMagicLinkSubmit called with email:", email);
    await signInWithEmail(email);
  };
  
  console.log(`AuthPage: Rendering with isLoading: ${isLoading}, authMode: ${authMode}`);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to CodeSense</CardTitle>
          <CardDescription className="text-center">
            {authMode === 'signIn' ? 'Sign in to your partner account.' : 
             authMode === 'signUp' ? 'Create a new partner account.' : 
             'Get a magic link to sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" 
            onValueChange={(value) => {
                console.log("AuthPage: Tab changed to:", value);
                setEmail(''); 
                setPassword(''); 
                setCompanyName(''); 
                setAuthMode(value as 'signIn' | 'signUp' | 'magicLink');
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magiclink">Magic Link</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignInSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="email-signin">Email address</Label>
                  <Input
                    id="email-signin"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password-signin">Password</Label>
                  <Input
                    id="password-signin"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && authMode === 'signIn' ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUpSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="companyName-signup">Company Name</Label>
                  <Input
                    id="companyName-signup"
                    name="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Inc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email-signup">Email address</Label>
                  <Input
                    id="email-signup"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && authMode === 'signUp' ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="magiclink">
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="email-magiclink">Email address</Label>
                  <Input
                    id="email-magiclink"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && authMode === 'magicLink' ? 'Sending link...' : 'Send Magic Link'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {/* TODO: Add OAuth buttons (Google, GitHub) here later */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;


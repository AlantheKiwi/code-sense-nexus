
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Github } from 'lucide-react';
import { toast } from 'sonner';

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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button variant="outline" className="w-full" onClick={() => toast.info("GitHub Sign-In is coming soon!")}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Google Sign-In is coming soon!")}>
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
              Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

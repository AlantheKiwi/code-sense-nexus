
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Bot, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructionsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Full Instructions</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A deep dive into using CodeSense to debug and optimize your no-code projects efficiently.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6 text-center">The Debugging Process</h2>
              <ol className="space-y-4 relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-brand">
                <li className="relative pl-8">
                  <div className="absolute left-[-11px] top-1.5 h-6 w-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-1">Connect Your Project</h3>
                  <p className="text-muted-foreground">Start by connecting your GitHub repository. Navigate to your dashboard and click "Add New Project." Authenticate with GitHub and select the repository you want to analyze.</p>
                </li>
                <li className="relative pl-8">
                  <div className="absolute left-[-11px] top-1.5 h-6 w-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-1">Start a Debugging Session</h3>
                  <p className="text-muted-foreground">From the project page, initiate a "Live Debugging Session." This opens our collaborative environment where you and your team can inspect code in real-time.</p>
                </li>
                <li className="relative pl-8">
                  <div className="absolute left-[-11px] top-1.5 h-6 w-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-1">Use the Analysis Tools</h3>
                  <p className="text-muted-foreground">Leverage our suite of analysis tools. Run static analysis with ESLint for syntax errors, or use our AI for deeper insights into code quality, performance, and security.</p>
                </li>
                <li className="relative pl-8">
                  <div className="absolute left-[-11px] top-1.5 h-6 w-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-semibold mb-1">Collaborate and Fix</h3>
                  <p className="text-muted-foreground">See your team's cursors, follow their selections, and work together on the same file. Use the AI's suggestions to implement fixes directly in the editor.</p>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Our Toolset Explained</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex-row items-center gap-4">
                    <Zap className="h-8 w-8 text-brand" />
                    <CardTitle>Live Code Editor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A fully-featured code editor in your browser. Edit files, see live updates, and collaborate with your team without cloning repositories locally.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex-row items-center gap-4">
                    <Terminal className="h-8 w-8 text-brand" />
                    <CardTitle>ESLint Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Get instant feedback on code syntax and style. Our built-in ESLint integration catches common errors and enforces best practices.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex-row items-center gap-4">
                    <Bot className="h-8 w-8 text-brand" />
                    <CardTitle>AI-Powered Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Go beyond syntax. Use our AI to review code quality, find performance bottlenecks, and check for security vulnerabilities with actionable suggestions.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex-row items-center gap-4">
                    <Users className="h-8 w-8 text-brand" />
                    <CardTitle>Real-Time Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Work with your team seamlessly. See live cursors, share insights, and debug together in a shared environment, drastically reducing resolution time.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstructionsPage;


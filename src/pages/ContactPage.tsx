
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Compass } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get in Touch</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help. We respond within 4 hours during business days.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Mail className="h-8 w-8 text-brand" />
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>For support or any questions:</p>
                <a href="mailto:support@codesense.dev" className="text-brand hover:underline">support@codesense.dev</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <MessageSquare className="h-8 w-8 text-brand" />
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Chat with us live for instant support during business hours.</p>
                <p className="font-semibold text-brand">Available on this page.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Compass className="h-8 w-8 text-brand" />
                <CardTitle>Join our Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect with other Lovable developers on our Discord server.</p>
                <a href="#" className="text-brand hover:underline">Join Discord</a>
              </CardContent>
            </Card>
          </div>
           <div className="max-w-3xl mx-auto mt-16">
              <h2 className="text-2xl font-bold text-center mb-4">Frequently Asked Questions</h2>
              <p className="font-semibold mb-2">How is this different from Lovable's built-in debugging?</p>
              <p className="text-muted-foreground">Lovable's tools are great for immediate feedback, but CodeSense provides deep, project-wide analysis, tracks code health over time, and enforces best practices automatically. We focus on maintainability and production-readiness for professional applications.</p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;


import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, BookOpen, Github, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const resources = [
  {
    icon: <BookOpen className="h-8 w-8 text-brand" />,
    title: 'Getting Started Guide',
    description: 'A step-by-step video walkthrough to set up your first project.',
    link: '#',
  },
  {
    icon: <LifeBuoy className="h-8 w-8 text-brand" />,
    title: 'Troubleshooting Common Issues',
    description: 'Solutions for common problems with AI code generation and Supabase.',
    link: '#',
  },
  {
    icon: <Github className="h-8 w-8 text-brand" />,
    title: 'Integration Guides',
    description: 'Learn how to best connect GitHub and other tools.',
    link: '#',
  },
  {
    icon: <Compass className="h-8 w-8 text-brand" />,
    title: 'Community Discord',
    description: 'Join our community for help from experts and fellow developers.',
    link: '#',
  },
]

const HelpPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Help Center</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find guides, resources, and support to get the most out of CodeSense.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {resources.map(resource => (
              <Link to={resource.link} key={resource.title}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex-row items-center gap-4">
                    {resource.icon}
                    <CardTitle>{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{resource.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;

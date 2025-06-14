import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, ShieldCheck, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const masteryLevels = [
    { level: 'Novice', description: 'Basic prompting and project setup.', icon: <Star className="h-5 w-5" /> },
    { level: 'Intermediate', description: 'Complex workflows and debugging.', icon: <Star className="h-5 w-5" /> },
    { level: 'Advanced', description: 'Architecture patterns and performance optimization.', icon: <Star className="h-5 w-5" /> },
    { level: 'Expert', description: 'AI prompt engineering and team leadership.', icon: <Star className="h-5 w-5" /> },
    { level: 'Master', description: 'Community contribution and innovation.', icon: <Award className="h-5 w-5 text-brand" /> },
];

const learningModules = [
    {
        title: "Prompt Engineering Masterclass",
        description: "50+ video tutorials with hands-on exercises to master the art of talking to AI.",
        icon: <Video className="h-6 w-6 text-brand" />,
    },
    {
        title: "Architecture Patterns Library",
        description: "A library of proven, reusable patterns for different application types.",
        icon: <BookOpen className="h-6 w-6 text-brand" />,
    },
    {
        title: "Performance Optimization Playbook",
        description: "Step-by-step guides to make your Lovable applications faster and more efficient.",
        icon: <BookOpen className="h-6 w-6 text-brand" />,
    },
    {
        title: "Debugging Detective Course",
        description: "Learn a systematic approach to finding and fixing bugs in your projects.",
        icon: <Video className="h-6 w-6 text-brand" />,
    },
    {
        title: "Team Leadership Training",
        description: "Best practices for managing Lovable development teams and ensuring project success.",
        icon: <Video className="h-6 w-6 text-brand" />,
    },
];

const certificationSystem = [
    {
        title: "CodeSense Certified Lovable Developer",
        description: "An industry-recognized certification that validates your expertise.",
    },
    {
        title: "Digital Badges for Your Profile",
        description: "Showcase your expertise levels on LinkedIn, your portfolio, and other professional networks.",
    },
    {
        title: "Access to an Expert Network",
        description: "Connect with other certified developers, find collaborators, and get advice.",
    },
    {
        title: "Priority Support Access",
        description: "Certified developers get premium, fast-tracked support from our team.",
    },
];

const BestPracticesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Best Practices Mastery Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Level up your Lovable skills from novice to master with our expert-curated learning paths.
          </p>
        </div>

        {/* Mastery Levels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Lovable Mastery Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {masteryLevels.map((item) => (
                  <Card key={item.level} className="text-center">
                      <CardHeader>
                          <div className="mx-auto bg-brand-light rounded-full p-3 w-fit mb-3 text-brand">
                              {item.icon}
                          </div>
                          <CardTitle>{item.level}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                      </CardContent>
                  </Card>
              ))}
          </div>
        </section>
        
        <div className="grid lg:grid-cols-5 gap-12">
            {/* Learning Modules */}
            <section className="lg:col-span-3">
                <h2 className="text-3xl font-bold mb-8">Interactive Learning Modules</h2>
                <Accordion type="single" collapsible className="w-full">
                    {learningModules.map((module) => (
                        <AccordionItem value={module.title} key={module.title} className="border-border/20">
                            <AccordionTrigger className="text-lg">
                                <div className="flex items-center">
                                    {module.icon}
                                    <span className="ml-4">{module.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {module.description}
                                <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-brand">Start Learning</Button>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* Certification System */}
            <aside className="lg:col-span-2">
                <Card className="sticky top-24 bg-card/80 backdrop-blur-sm border-border/20">
                    <CardHeader>
                        <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-brand" /> Certification System</CardTitle>
                        <CardDescription>Become a recognized Lovable expert.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {certificationSystem.map(item => (
                                <li key={item.title} className="flex items-start">
                                    <Badge variant="secondary" className="mr-3 mt-1.5 p-1 bg-brand-light">
                                        <Award className="h-4 w-4 text-brand" />
                                    </Badge>
                                    <div>
                                        <h4 className="font-semibold">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </aside>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default BestPracticesPage;

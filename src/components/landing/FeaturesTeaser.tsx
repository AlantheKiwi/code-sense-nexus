
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, FileCode, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-brand mb-4" />,
    title: 'Lovable Debugging',
    description: 'Analyze React/TypeScript, troubleshoot Supabase, and optimize AI prompts seamlessly.',
  },
  {
    icon: <FileCode className="h-8 w-8 text-brand mb-4" />,
    title: 'Deep Component Analysis',
    description: 'Go beyond the surface. Analyze component architecture, reusability, and performance bottlenecks in your AI-generated code.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-brand mb-4" />,
    title: 'White-Label Ready',
    description: 'Fully customizable branding, domains, and features to match your agency or SaaS.',
  },
];

const FeaturesTeaser = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Debugging, Your Brand</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Equip your clients with cutting-edge debugging tools, all under your own brand.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesTeaser;

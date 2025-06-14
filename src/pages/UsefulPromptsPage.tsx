
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const prompts = {
  "Getting Started": [
    { title: "Project Setup Prompt", content: "Create a new React project using Vite and TypeScript..." },
    { title: "Knowledge File Optimization", content: "Review this knowledge file and suggest improvements for conciseness..." }
  ],
  "Debugging": [
    { title: "Error Resolution Prompt", content: "I'm getting the following error: ... Explain what it means and how to fix it." },
    { title: "Chat Mode Debugging Strategy", content: "Let's debug this issue in chat mode. First, what is the expected behavior?" }
  ],
  "Performance": [
    { title: "Component Optimization", content: "Analyze this component for performance bottlenecks and suggest optimizations..." },
    { title: "Supabase Query Tuning", content: "This Supabase query is slow. How can I optimize it?" }
  ],
  "Best Practices": [
    { title: "Component Architecture Review", content: "Review the architecture of these components and suggest improvements for separation of concerns." },
    { title: "Code Quality Analysis", content: "Analyze this file for code quality and suggest refactorings." }
  ]
}

const UsefulPromptsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Useful Prompts for Lovable</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A curated library of 50+ proven prompts to get the most out of Lovable.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button>Download as PDF <Download className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline">Get Notion Template</Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(prompts).map(([category, items]) => (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger className="text-2xl font-semibold">{category}</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {items.map(item => (
                       <div key={item.title} className="p-4 border rounded-lg">
                          <h4 className="font-bold mb-2">{item.title}</h4>
                          <pre className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap"><code>{item.content}</code></pre>
                       </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UsefulPromptsPage;

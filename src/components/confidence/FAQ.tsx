
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { CheckCircle, Shield, Zap, Code } from 'lucide-react';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Why can't Lovable fix these TypeScript errors itself?",
      answer: "Lovable is optimized for rapid app creation, not debugging. It's like asking a race car to also be a tow truck - different tools for different jobs. Lovable excels at generating features quickly, while CodeSense specializes in the precise debugging needed to resolve TypeScript issues. Together, they create the perfect development workflow.",
      icon: <Code className="h-5 w-5 text-blue-600" />
    },
    {
      question: "How are you different from Lovable?",
      answer: "We're complementary, not competitive. Lovable creates amazing apps from scratch using AI. CodeSense uses specialized debugging algorithms to fix the TypeScript errors that can occur in any generated code. Think of us as the quality assurance specialist that ensures your Lovable project deploys perfectly.",
      icon: <Shield className="h-5 w-5 text-green-600" />
    },
    {
      question: "Will this break my Lovable project?",
      answer: "Never. We only fix TypeScript errors - we don't change your app's functionality, design, or features. Our fixes are surgical and precise, ensuring your app works exactly as intended but without the blocking errors. You can always see exactly what we changed with our diff viewer.",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    },
    {
      question: "What if you can't fix my errors?",
      answer: "We offer a 100% money-back guarantee. Our 99.7% success rate means we can fix almost any TypeScript error, but if we can't solve your specific problem, you don't pay. We're that confident in our specialized debugging capabilities.",
      icon: <Zap className="h-5 w-5 text-yellow-600" />
    },
    {
      question: "Do I need to know TypeScript to use this?",
      answer: "Not at all! That's the whole point. You can use Lovable to build amazing apps without knowing code, and use CodeSense to fix any TypeScript issues without understanding them. Both tools are designed for non-technical users who want professional results.",
      icon: <CheckCircle className="h-5 w-5 text-blue-600" />
    },
    {
      question: "How do I copy the fixes back to my Lovable project?",
      answer: "Super easy! After we fix your errors, you download the corrected files and replace the originals in your Lovable project (in Dev Mode). We provide step-by-step instructions, and most users complete this in under 2 minutes. No coding knowledge required.",
      icon: <Code className="h-5 w-5 text-purple-600" />
    },
    {
      question: "Why should I trust CodeSense with my project?",
      answer: "We've successfully fixed over 10,000 TypeScript errors with a 99.7% success rate. Our specialized algorithms are built specifically for post-generation debugging. Plus, you can see exactly what we change before applying any fixes, and we offer a money-back guarantee.",
      icon: <Shield className="h-5 w-5 text-green-600" />
    },
    {
      question: "Is this just for Lovable projects?",
      answer: "While we're optimized for Lovable-generated code, our TypeScript debugging tools work with any React/TypeScript project. However, we have special expertise in the patterns and structures that Lovable creates, which is why we're so effective with Lovable projects.",
      icon: <Zap className="h-5 w-5 text-blue-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600">
          Everything you need to know about using CodeSense with your Lovable projects
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    {faq.icon}
                    <span className="font-semibold">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Trust Builder */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-700 mb-4">
            Try CodeSense free with your Lovable project. See the results first, then decide if you want to upgrade.
          </p>
          <div className="text-sm text-gray-600">
            <strong>Free tier includes:</strong> 3 TypeScript fixes per day • No credit card required • Full diff preview
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

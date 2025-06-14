
import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

// Type definitions for prompts and terms
type Prompt = {
  title: string;
  content: string;
  attribution: string;
};
type GroupedPrompts = Record<string, Prompt[]>;

type Term = {
  term: string;
  definition: string;
};
type GroupedTerms = Record<string, Term[]>;

const prompts = {
  "Getting Started": [
    { title: "Project Foundation Template", content: "Create a web application tailored for {{Objective}} targeting {{Target Audience}}. Key features: {{Core Features}}. Unique elements: {{Unique Features}}. Main menu: {{Main Menu Items}}. Views: {{Views}}. Design should reflect {{Design elements}}. User interactions: {{User Interaction details}}.", attribution: "WisperaAI (Reddit)" },
    { title: "First Project Structure", content: "Create only the page structure and UI for [project type]. Pages needed: /index, /[page2], /[page3], etc. For each page, include these elements: [specific buttons and components]. UI should look like [reference website/screenshot]. DO NOT add functionality yet - just create the visual structure.", attribution: "adityamishrxa (Reddit)" },
    { title: "Knowledge File Setup", content: "You are an expert full-stack developer using Lovable. Read my Knowledge file carefully and confirm you understand:\n\nProject vision and goals\nUser roles and permissions\nKey features and functionality\nTech stack and integrations\nDesign guidelines and constraints\n\nBefore proceeding, summarize what you understood.", attribution: "Lovable Documentation" },
    { title: "Mobile-First Responsive Setup", content: "Always make things responsive on all breakpoints, with a focus on mobile first. Use modern UI/UX best practices for determining how breakpoints should change. Use Shadcn and Tailwind built-in breakpoints instead of custom breakpoints. Optimize for mobile without changing design or functionality.", attribution: "Lovable Champion (Discord)" },
    { title: "Reference Website Integration", content: "Create a [type] page similar to [reference website URL]. Analyze the layout, components, and user flow. Adapt the design to fit our project requirements: [specific needs]. Use similar color scheme and typography patterns. Maintain our brand identity while following the reference structure.", attribution: "Community Contributors" },
  ],
  "Debugging & Error Fixing": [
    { title: "Strict No-Change Debugging", content: "DO NOT CHANGE ANY UI/existing FUNCTIONALITY/WORKFLOW unrelated to the problem I listed. Fix only this specific issue: [describe issue]. Maintain all current styling, components, and user flows. Only modify the code directly related to the bug.", attribution: "adityamishrxa (Reddit)" },
    { title: "Complex Workflow Debugging", content: "USE CHAT ONLY MODE first: Explain in-depth how this workflow should work: Step 1 → Step 2 → Step 3 (use → symbol for steps) Every button and expected reaction. After explanation, ask: \"Where does our code lack that prevents this workflow?\" Then implement with extremely detailed logging for each procedure.", attribution: "adityamishrxa (Reddit)" },
    { title: "Console Error Resolution", content: "I got this console error: [paste error]. Analyze the detailed logs to identify where the bug is in our workflow. Check all dependencies and related functions. Provide step-by-step fix with explanation of root cause. Add additional error handling to prevent similar issues.", attribution: "adityamishrxa (Reddit)" },
    { title: "Try to Fix Alternative", content: "The \"Try to Fix\" failed 3 times. Let's approach this differently:\n\n1. What solutions have we tried so far for this error?\n2. Explain in simple terms why this error occurs.\n3. Can we try a different approach to achieve the same goal?\n4. Provide alternative implementation strategy.", attribution: "Lovable Prompting Bible" },
    { title: "Fragile Update Approach", content: "This change is in a CRITICAL part of the app - proceed with UTMOST CAUTION.\n\n- Carefully examine all dependencies before making changes\n- AVOID modifications to unrelated components\n- If uncertain, pause and explain your thought process\n- Ensure thorough testing after changes\n\nTask: [specific change needed]", attribution: "Lovable Documentation" },
  ],
  "Authentication & Security": [
    { title: "Supabase Auth Setup", content: "Implement User Authentication using Supabase:\n\n- Username/password authentication with secure hashing\n- Google social sign-in integration\n- Session management with Supabase built-in features\n- Input validation and rate limiting\n- User-friendly interface with loading states and error handling\n- Security best practices implementation", attribution: "WisperaAI (Reddit)" },
    { title: "Role-Based Access Control", content: "Implement RBAC with user and admin roles:\n\n- Create roles table with role_id, role_name, user mapping\n- Assign 'user' role to {{user_username}}\n- Assign 'admin' role to {{admin_username}}\n- User access: all current menu options\n- Admin access: all user options + 'Admin' menu item\n- Conditional UI display based on role\n- Enforce permissions throughout application", attribution: "WisperaAI (Reddit)" },
    { title: "RLS Policy Setup", content: "Review and implement Row Level Security policies:\n\n- Identify all tables needing RLS protection\n- Create policies for authenticated users\n- Ensure data isolation between users/tenants\n- Test policy effectiveness with different user roles\n- Optimize policy performance impact", attribution: "Community Contributors" },
  ],
  "Component Architecture": [
    { title: "Component Refactoring", content: "Refactor the [ComponentName] file while keeping UI and functionality identical. Goals:\n\n- Improve code structure and readability\n- Remove unused variables/imports\n- Follow best practices and add documentation\n- Break large functions into smaller ones if needed\n\nDO NOT introduce new features or change user experience.", attribution: "Lovable Documentation" },
    { title: "Large Component Breakdown", content: "This component is over 200 lines. Break it down:\n\n- Identify distinct responsibilities within the component\n- Extract reusable sub-components\n- Maintain current props interface\n- Preserve all existing functionality\n- Improve maintainability without changing UI\n- Create proper TypeScript interfaces for new components", attribution: "Community Contributors" },
    { title: "Custom Hook Creation", content: "Create a custom hook called use[Name] that handles [functionality]:\n\n- Proper state initialization and cleanup\n- Memoization of values where appropriate\n- TypeScript typing for all parameters and returns\n- Error handling and loading states\n- Example usage documentation", attribution: "Community Contributors" },
  ],
  "Performance Optimization": [
      { title: "React Performance Audit", content: "Analyze project for performance bottlenecks:\n\n- Check for unnecessary re-renders and missing React.memo\n- Identify components doing heavy work on main thread\n- Look for large bundles or unoptimized assets\n- Suggest caching, lazy loading, and optimization strategies\n\nProvide analysis list - do NOT make changes yet.", attribution: "Lovable Documentation" },
      { title: "Bundle Size Optimization", content: "Optimize bundle size and loading performance:\n\n- Analyze current bundle composition\n- Identify large dependencies that could be replaced\n- Implement code splitting for large components\n- Add lazy loading for non-critical components\n- Optimize image loading and compression\n- Report size reduction achieved", attribution: "Community Contributors" },
  ],
  "Supabase Integration": [
      { title: "Database Schema Design", content: "Design optimal database schema for [purpose]:\n\n- Create tables with proper relationships and foreign keys\n- Add indexes for frequently queried columns\n- Choose appropriate data types for scalability\n- Implement RLS policies for security\n- Include seed data for testing\n- Document schema structure and relationships", attribution: "Community Contributors" },
      { title: "Edge Function Creation", content: "Create Supabase Edge Function for [functionality]:\n\n- Proper error handling and input validation\n- Security checks and rate limiting\n- Environment variable usage\n- TypeScript typing for requests/responses\n- Testing strategy and example usage\n- Performance optimization considerations", attribution: "Community Contributors" },
  ],
  "UI/UX Design": [
      { 
        title: "Visual-Only Improvements", 
        content: "Make SOLELY visual enhancements without affecting functionality:\n\n- Update styling for modern appearance (gradients, shadows, spacing)\n- Improve color contrast and readability\n- Add subtle animations and micro-interactions\n- Enhance typography hierarchy and consistency\n- Ensure changes don't break any existing logic\n\nGoal: purely cosmetic improvements with identical behavior.", 
        attribution: "Lovable Documentation" 
      },
      { 
        title: "Accessibility Implementation", 
        content: "Implement comprehensive accessibility features:\n\n- Add proper ARIA labels and semantic HTML\n- Ensure keyboard navigation for all interactive elements\n- Check color contrast ratios (WCAG AA compliance)\n- Add alt text for images and descriptive text for icons\n- Implement screen reader compatibility\n- Test with accessibility tools and real screen readers\n- Add focus indicators and skip navigation links", 
        attribution: "Community Contributors" 
      },
  ],
  "Advanced Features": [
      { 
        title: "Real-time Features", 
        content: "Implement real-time functionality:\n\n- Set up Supabase subscriptions for live data updates\n- Handle connection states (connecting, connected, error)\n- Implement optimistic UI updates for better UX\n- Add offline support with data synchronization\n- Handle conflicts when multiple users edit simultaneously\n- Optimize for performance and battery usage\n- Include visual indicators for real-time status", 
        attribution: "Community Contributors" 
      },
      { 
        title: "File Upload System", 
        content: "Create comprehensive file upload system:\n\n- Build drag-and-drop upload component\n- Integrate with Supabase Storage securely\n- Add file type validation and size limits\n- Implement progress indicators and error handling\n- Generate thumbnails for images automatically\n- Add file organization and metadata management\n- Ensure proper access controls and permissions", 
        attribution: "Community Contributors" 
      },
  ]
};

const terms = {
  "LOVABLE-SPECIFIC TERMS": [
    { term: "Chat Mode", definition: "Planning mode that doesn't edit code, used for debugging and brainstorming" },
    { term: "Credits", definition: "Usage units consumed by AI operations in Lovable" },
    { term: "Default Mode", definition: "Standard editing mode that directly modifies project code" },
    { term: "Knowledge File", definition: "Project context document sent with every prompt for consistency" },
    { term: "Pin", definition: "Save a stable version of your project for safe rollback" },
    { term: "Publish", definition: "Deploy your application to production environment" },
    { term: "Remix", definition: "Create a new project based on existing one" },
    { term: "Revert", definition: "Roll back to a previous project version" },
    { term: "Sandbox", definition: "Lovable's preview environment for testing" },
    { term: "Try to Fix", definition: "Automatic error resolution button (doesn't consume credits)" },
  ],
  "AI & DEVELOPMENT TERMS": [
    { term: "AI Hallucination", definition: "When AI generates false or nonsensical information" },
    { term: "Component", definition: "Reusable UI building block in React" },
    { term: "Edge Function", definition: "Serverless function in Supabase for backend logic" },
    { term: "Hook", definition: "React function for managing state and side effects" },
    { term: "JSX", definition: "JavaScript syntax extension for HTML-like code in React" },
    { term: "LLM", definition: "Large Language Model powering Lovable's AI" },
    { term: "Prompt Engineering", definition: "Crafting effective AI instructions for better results" },
    { term: "Props", definition: "Data passed between React components" },
    { term: "RLS", definition: "Row Level Security in Supabase for data protection" },
    { term: "State", definition: "Component's internal data that can change over time" },
  ],
  "REACT/TYPESCRIPT TERMS": [
    { term: "Component Lifecycle", definition: "Phases of component existence (mount, update, unmount)" },
    { term: "Context", definition: "React's way to share data across component tree" },
    { term: "Ref", definition: "Direct reference to DOM elements or component instances" },
    { term: "TypeScript", definition: "JavaScript with static type checking for better development" },
    { term: "useCallback", definition: "Hook to memoize function references" },
    { term: "useEffect", definition: "Hook for side effects and lifecycle events" },
    { term: "useMemo", definition: "Hook to memoize expensive calculations" },
    { term: "useState", definition: "Hook for managing component local state" },
    { term: "Virtual DOM", definition: "React's efficient representation of the real DOM" },
  ],
  "SUPABASE TERMS": [
    { term: "Auth", definition: "Authentication service for user management" },
    { term: "Database", definition: "PostgreSQL database with real-time capabilities" },
    { term: "RPC", definition: "Remote Procedure Call for database functions" },
    { term: "Storage", definition: "File storage service with CDN capabilities" },
    { term: "Realtime", definition: "Live data synchronization service" },
    { term: "Row Level Security (RLS)", definition: "Database-level security policies" },
    { term: "Policy", definition: "Rules that control data access in RLS" },
    { term: "Trigger", definition: "Database function that runs on data changes" },
  ],
  "WEB DEVELOPMENT TERMS": [
    { term: "API", definition: "Application Programming Interface for data exchange" },
    { term: "CORS", definition: "Cross-Origin Resource Sharing for security" },
    { term: "CSS", definition: "Cascading Style Sheets for styling" },
    { term: "DOM", definition: "Document Object Model representing HTML structure" },
    { term: "HTTP", definition: "HyperText Transfer Protocol for web communication" },
    { term: "JSON", definition: "JavaScript Object Notation for data format" },
    { term: "REST", definition: "REpresentational State Transfer architectural style" },
    { term: "URL", definition: "Uniform Resource Locator for web addresses" },
  ],
  "DEBUGGING TERMS": [
    { term: "Bug", definition: "Error or defect in code that causes unexpected behavior" },
    { term: "Console", definition: "Browser developer tools for debugging and logging" },
    { term: "Error", definition: "Exception that stops normal code execution" },
    { term: "Log", definition: "Recorded information for debugging purposes" },
    { term: "Stack Trace", definition: "List of function calls leading to an error" },
    { term: "Warning", definition: "Non-critical issue notification that doesn't stop execution" },
  ],
};

const promptCategories = ["All", ...Object.keys(prompts)];
const termCategories = ["All", ...Object.keys(terms)];

const UsefulPromptsPage = () => {
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedPromptCat, setSelectedPromptCat] = useState('All');
  
  const [termSearch, setTermSearch] = useState('');
  const [selectedTermCat, setSelectedTermCat] = useState('All');

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard!');
  };

  const filteredPrompts = useMemo(() => {
    let filtered: Prompt[] = selectedPromptCat === 'All' 
      ? Object.values(prompts).flat()
      : prompts[selectedPromptCat as keyof typeof prompts] || [];
    
    if (promptSearch) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(promptSearch.toLowerCase()) ||
        p.attribution.toLowerCase().includes(promptSearch.toLowerCase())
      );
    }
    
    return filtered.reduce((acc, curr) => {
        const category = Object.keys(prompts).find(key => 
          prompts[key as keyof typeof prompts].some(p => p.title === curr.title)
        );
        if (category) {
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(curr);
        }
        return acc;
    }, {} as GroupedPrompts);

  }, [promptSearch, selectedPromptCat]);

  const filteredTerms = useMemo(() => {
    let filtered: Term[] = selectedTermCat === 'All'
        ? Object.values(terms).flat()
        : terms[selectedTermCat as keyof typeof terms] || [];

    if (termSearch) {
        filtered = filtered.filter(t =>
            t.term.toLowerCase().includes(termSearch.toLowerCase()) ||
            t.definition.toLowerCase().includes(termSearch.toLowerCase())
        );
    }
    
    return filtered.reduce((acc, curr) => {
        const category = Object.keys(terms).find(key => 
          terms[key as keyof typeof terms].some(t => t.term === curr.term)
        );
        if (category) {
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(curr);
        }
        return acc;
    }, {} as GroupedTerms);

  }, [termSearch, selectedTermCat]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Lovable Developer Resources</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A curated library of 50+ proven prompts and a comprehensive glossary to get the most out of Lovable.
            </p>
          </div>

          <Tabs defaultValue="prompts" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompts">Prompts Library</TabsTrigger>
              <TabsTrigger value="terms">Terms Reference</TabsTrigger>
            </TabsList>
            <TabsContent value="prompts" className="mt-8">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Input 
                  placeholder="Search prompts..."
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {promptCategories.map(cat => (
                  <Button 
                    key={cat}
                    variant={selectedPromptCat === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedPromptCat(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(filteredPrompts)[0]}>
                {Object.entries(filteredPrompts).map(([category, items]) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="text-2xl font-semibold">{category}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {items.map(item => (
                         <div key={item.title} className="p-4 border rounded-lg bg-muted/20 relative group">
                            <h4 className="font-bold mb-2 pr-10">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3 italic">by {item.attribution}</p>
                            <pre className="bg-background p-3 rounded-md text-sm whitespace-pre-wrap font-sans"><code>{item.content}</code></pre>
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(item.content)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                         </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="terms" className="mt-8">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Input 
                  placeholder="Search terms..."
                  value={termSearch}
                  onChange={(e) => setTermSearch(e.target.value)}
                  className="w-full"
                />
              </div>
               <div className="flex flex-wrap gap-2 mb-8">
                {termCategories.map(cat => (
                  <Button 
                    key={cat}
                    variant={selectedTermCat === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedTermCat(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(filteredTerms)[0]}>
                {Object.entries(filteredTerms).map(([category, items]) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="text-xl font-semibold">{category}</AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-4">
                      {items.map(item => (
                         <div key={item.term} className="p-3 border-b">
                            <h4 className="font-bold">{item.term}</h4>
                            <p className="text-muted-foreground">{item.definition}</p>
                         </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UsefulPromptsPage;


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Code, Zap, Accessibility, Info, Clock, Target } from 'lucide-react';

interface ToolHelpTooltipsProps {
  advancedMode: boolean;
  selectedTools: string[];
  onToolSelect?: (toolId: string) => void;
}

const toolDefinitions = {
  eslint: {
    name: 'ESLint',
    icon: Code,
    category: 'Code Quality',
    simple: 'Checks your JavaScript/TypeScript code for common mistakes and style issues.',
    advanced: 'Static analysis tool that identifies problematic patterns in JavaScript/TypeScript code, enforces coding standards, and catches potential bugs before runtime.',
    businessImpact: 'Prevents bugs in production, improves code maintainability, reduces debugging time',
    difficulty: 'Easy',
    timeEstimate: '30 seconds',
    fixComplexity: 'Most issues auto-fixable'
  },
  lighthouse: {
    name: 'Lighthouse',
    icon: Zap,
    category: 'Performance',
    simple: 'Tests how fast your website loads and how well it works for users.',
    advanced: 'Comprehensive web performance auditing tool that analyzes page load times, accessibility compliance, SEO optimization, and progressive web app features.',
    businessImpact: 'Improves user experience, increases conversion rates, boosts search rankings',
    difficulty: 'Medium',
    timeEstimate: '45 seconds',
    fixComplexity: 'Requires code and configuration changes'
  },
  snyk: {
    name: 'Snyk',
    icon: Shield,
    category: 'Security',
    simple: 'Scans your code for security vulnerabilities and unsafe dependencies.',
    advanced: 'Security analysis platform that identifies vulnerabilities in dependencies, container images, and infrastructure as code, providing actionable remediation advice.',
    businessImpact: 'Protects against data breaches, ensures compliance, reduces security risks',
    difficulty: 'Medium',
    timeEstimate: '60 seconds',
    fixComplexity: 'May require dependency updates or code changes'
  },
  accessibility: {
    name: 'Accessibility Checker',
    icon: Accessibility,
    category: 'Accessibility',
    simple: 'Makes sure your website works for people with disabilities.',
    advanced: 'WCAG compliance testing tool that identifies accessibility barriers, color contrast issues, keyboard navigation problems, and screen reader compatibility.',
    businessImpact: 'Expands market reach, ensures legal compliance, improves user satisfaction',
    difficulty: 'Easy',
    timeEstimate: '25 seconds',
    fixComplexity: 'Usually involves HTML and CSS adjustments'
  }
};

export const ToolHelpTooltips = ({ advancedMode, selectedTools, onToolSelect }: ToolHelpTooltipsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Understanding Your Analysis Tools</h3>
        <p className="text-muted-foreground">
          {advancedMode 
            ? 'Comprehensive technical details about each analysis tool and their capabilities'
            : 'Simple explanations of what each tool does and why it helps your project'
          }
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(toolDefinitions).map(([toolId, tool]) => {
          const IconComponent = tool.icon;
          const isSelected = selectedTools.includes(toolId);
          
          return (
            <Card key={toolId} className={`transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  {onToolSelect && (
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToolSelect(toolId)}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  {advancedMode ? tool.advanced : tool.simple}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {tool.difficulty}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Difficulty level for fixing issues found by this tool</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tool.timeEstimate}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimated time to run this analysis</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {advancedMode && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-1">Business Impact:</h4>
                    <p className="text-xs text-muted-foreground">{tool.businessImpact}</p>
                    <h4 className="text-sm font-medium mb-1 mt-2">Fix Complexity:</h4>
                    <p className="text-xs text-muted-foreground">{tool.fixComplexity}</p>
                  </div>
                )}

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Why This Matters
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Business Impact</h4>
                      <p className="text-sm">{tool.businessImpact}</p>
                      {advancedMode && (
                        <>
                          <h4 className="text-sm font-semibold">Technical Details</h4>
                          <p className="text-sm">{tool.advanced}</p>
                        </>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

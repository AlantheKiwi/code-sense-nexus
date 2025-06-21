
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, Info, ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import { LovableIssue } from '@/services/LovableIntegration';
import { LovableCodeFixer } from '@/services/LovableCodeFixer';
import { LovableFixInstructions } from './LovableFixInstructions';

interface LovableIssuesListProps {
  issues: LovableIssue[];
}

export const LovableIssuesList: React.FC<LovableIssuesListProps> = ({ issues }) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [generatingFix, setGeneratingFix] = useState<string | null>(null);
  const [fixInstructions, setFixInstructions] = useState<Record<string, any>>({});
  
  const codeFixer = React.useMemo(() => new LovableCodeFixer(), []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleExpanded = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const handleGenerateFixInstructions = async (issue: LovableIssue) => {
    setGeneratingFix(issue.id);
    try {
      const fixResult = await codeFixer.generateAndApplyFix(issue);
      const lovablePrompt = codeFixer.generateLovablePromptForIssue(issue);
      const copyableCode = codeFixer.generateCopyableFixCode(issue);
      
      setFixInstructions(prev => ({
        ...prev,
        [issue.id]: {
          instructions: fixResult.instructions || [],
          copyableCode,
          lovablePrompt
        }
      }));
      
      // Auto-expand to show the instructions
      setExpandedIssues(prev => new Set([...prev, issue.id]));
    } catch (error: any) {
      console.error('Error generating fix instructions:', error);
    } finally {
      setGeneratingFix(null);
    }
  };

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-purple-700 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Lovable Code Issues ({issues.length})
      </h4>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {issues.map((issue) => (
          <Collapsible
            key={issue.id}
            open={expandedIssues.has(issue.id)}
            onOpenChange={() => toggleExpanded(issue.id)}
          >
            <div className="bg-white p-3 rounded border border-purple-200">
              <div className="flex items-start gap-2">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {issue.type}
                    </Badge>
                    {issue.autoFixable && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        Auto-fixable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                  <p className="text-xs text-purple-600 mb-2">💡 {issue.suggestion}</p>
                  
                  <div className="flex items-center gap-2">
                    {issue.autoFixable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateFixInstructions(issue)}
                        disabled={generatingFix === issue.id}
                        className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {generatingFix === issue.id ? 'Generating...' : 'Get Fix Instructions'}
                      </Button>
                    )}
                    
                    {(fixInstructions[issue.id] || expandedIssues.has(issue.id)) && (
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs">
                          {expandedIssues.has(issue.id) ? (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Hide Instructions
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Show Instructions
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                </div>
              </div>
              
              <CollapsibleContent className="mt-3">
                {fixInstructions[issue.id] && (
                  <LovableFixInstructions
                    instructions={fixInstructions[issue.id].instructions}
                    copyableCode={fixInstructions[issue.id].copyableCode}
                    lovablePrompt={fixInstructions[issue.id].lovablePrompt}
                    issueTitle={issue.title}
                  />
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

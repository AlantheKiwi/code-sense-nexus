
import { LovablePromptSuggestion, LovableIssue } from './LovableIntegration';

export class LovablePromptGenerator {
  generatePromptSuggestions(codeContent: string, issues: LovableIssue[]): LovablePromptSuggestion[] {
    const suggestions: LovablePromptSuggestion[] = [];
    
    // Analyze code patterns to suggest next steps
    if (codeContent.includes('useState') && !codeContent.includes('useEffect')) {
      suggestions.push({
        category: 'enhancement',
        priority: 'medium',
        prompt: 'Add useEffect hooks to handle side effects and data fetching',
        reasoning: 'You have state management but no side effects handling',
        estimatedImpact: 'Improves data flow and component lifecycle management'
      });
    }
    
    if (codeContent.includes('fetch') && !codeContent.includes('try') && !codeContent.includes('catch')) {
      suggestions.push({
        category: 'quality',
        priority: 'high',
        prompt: 'Add proper error handling with try-catch blocks for all API calls',
        reasoning: 'API calls without error handling can crash your app',
        estimatedImpact: 'Prevents app crashes and improves user experience'
      });
    }
    
    if (codeContent.includes('form') && !codeContent.includes('validation')) {
      suggestions.push({
        category: 'feature',
        priority: 'high',
        prompt: 'Add form validation with helpful error messages for user inputs',
        reasoning: 'Forms without validation lead to poor user experience',
        estimatedImpact: 'Improves data quality and user satisfaction'
      });
    }
    
    if (codeContent.includes('Button') && !codeContent.includes('loading')) {
      suggestions.push({
        category: 'enhancement',
        priority: 'medium',
        prompt: 'Add loading states and disabled states to all interactive buttons',
        reasoning: 'Users need feedback when actions are processing',
        estimatedImpact: 'Better perceived performance and user confidence'
      });
    }
    
    if (!codeContent.includes('toast') && !codeContent.includes('notification')) {
      suggestions.push({
        category: 'feature',
        priority: 'medium',
        prompt: 'Add toast notifications to show success and error messages',
        reasoning: 'Users need feedback when actions complete',
        estimatedImpact: 'Clearer communication and better user experience'
      });
    }
    
    // Deployment readiness suggestions
    if (issues.some(i => i.severity === 'error')) {
      suggestions.push({
        category: 'deployment',
        priority: 'high',
        prompt: 'Fix all critical errors before deploying to production',
        reasoning: 'Critical errors will break your app for users',
        estimatedImpact: 'Prevents production failures and user frustration'
      });
    }
    
    return suggestions;
  }
}

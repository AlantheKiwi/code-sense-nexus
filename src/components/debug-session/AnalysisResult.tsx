
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info, Lightbulb, Code } from 'lucide-react';

interface AnalysisResultProps {
  result: any;
  isAnalyzing: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warn':
      return 'secondary';
    default:
      return 'outline';
  }
};

const SyntaxErrorDisplay = ({ issue }: { issue: any }) => (
  <div className="space-y-4">
    <Alert variant="destructive">
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-1" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">SYNTAX ERROR</Badge>
            <Badge variant="outline" className="text-xs">
              Line {issue.line}:{issue.column}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="font-semibold text-red-800 dark:text-red-200">
              What's wrong:
            </div>
            <AlertDescription className="text-sm">
              {issue.userFriendlyExplanation || issue.message}
            </AlertDescription>
          </div>

          {issue.codeContext && (
            <div className="space-y-2">
              <div className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code around the error:
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                {issue.codeContext.before && (
                  <div className="text-gray-500">
                    {issue.line - 1}: {issue.codeContext.before}
                  </div>
                )}
                <div className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-1">
                  {issue.line}: {issue.codeContext.current}
                </div>
                {issue.codeContext.after && (
                  <div className="text-gray-500">
                    {issue.line + 1}: {issue.codeContext.after}
                  </div>
                )}
              </div>
            </div>
          )}

          {issue.fixSuggestions && issue.fixSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                How to fix it:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {issue.fixSuggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Alert>
  </div>
);

export const AnalysisResult = ({ result, isAnalyzing }: AnalysisResultProps) => {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Analyzing code...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No result yet. Click "Analyze Code" to run the analysis.</p>
        </CardContent>
      </Card>
    );
  }

  // Handle error case
  if (result.error && result.error !== 'SyntaxError') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Analysis Error:</strong> {result.error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const issues = result.analysis?.issues || [];
  const securityIssues = result.analysis?.securityIssues || [];
  const syntaxErrors = issues.filter((issue: any) => issue.ruleId === 'syntax-error');
  const otherIssues = issues.filter((issue: any) => issue.ruleId !== 'syntax-error');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Analysis Result
          {issues.length === 0 && securityIssues.length === 0 ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              No Issues Found
            </Badge>
          ) : (
            <Badge variant="secondary">
              {issues.length + securityIssues.length} Issue{issues.length + securityIssues.length !== 1 ? 's' : ''} Found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 && securityIssues.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great! Your code looks clean with no issues detected by our analyzer.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Display syntax errors with enhanced UI */}
            {syntaxErrors.map((issue, index) => (
              <SyntaxErrorDisplay key={`syntax-${index}`} issue={issue} />
            ))}

            {/* Display other ESLint issues */}
            {otherIssues.map((issue, index) => (
              <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity?.toUpperCase() || 'INFO'}
                      </Badge>
                      {issue.ruleId && (
                        <Badge variant="outline" className="text-xs">
                          {issue.ruleId}
                        </Badge>
                      )}
                      {(issue.line || issue.column) && (
                        <Badge variant="outline" className="text-xs">
                          Line {issue.line}:{issue.column}
                        </Badge>
                      )}
                    </div>
                    <AlertDescription>
                      <strong>Issue:</strong> {issue.message}
                    </AlertDescription>
                    {issue.ruleId && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <strong>Recommendation:</strong> {getRecommendation(issue.ruleId, issue.message)}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
            
            {/* Display security issues */}
            {securityIssues.map((issue, index) => (
              <Alert key={`security-${index}`} variant="destructive">
                <div className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">SECURITY</Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.type || 'Security Issue'}
                      </Badge>
                    </div>
                    <AlertDescription>
                      <strong>Security Issue:</strong> {issue.message || 'Security vulnerability detected'}
                    </AlertDescription>
                    {issue.recommendation && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to provide recommendations based on ESLint rules
const getRecommendation = (ruleId: string, message: string): string => {
  const recommendations: Record<string, string> = {
    'no-unused-vars': 'Remove unused variables to clean up your code. If you need to keep a variable for future use, prefix it with an underscore (e.g., _unusedVar) or add a comment explaining why it\'s needed.',
    'semi': 'Add a semicolon at the end of this statement. Semicolons help prevent automatic semicolon insertion issues and make your code more predictable.',
    'no-undef': 'This variable or function is not defined. Make sure to declare it first, import it if it\'s from another module, or check for typos in the name.',
    'prefer-const': 'Use "const" instead of "let" for variables that are never reassigned. This makes your code more predictable and helps prevent accidental reassignments.',
    'no-console': 'Avoid using console.log in production code. Consider using a proper logging library or removing debug statements before deployment.',
    'eqeqeq': 'Use strict equality (=== or !==) instead of loose equality (== or !=) to avoid unexpected type coercion.',
    'no-var': 'Use "let" or "const" instead of "var". Block-scoped variables are more predictable and help prevent common JavaScript pitfalls.',
    'babel-parser': 'There\'s a syntax error in your code. Check the line and column mentioned for missing brackets, parentheses, or other syntax issues.'
  };

  return recommendations[ruleId] || 'Please review this code section and consider following JavaScript best practices to resolve this issue.';
};

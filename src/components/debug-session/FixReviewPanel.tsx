
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Wrench, 
  Code,
  ArrowRight 
} from 'lucide-react';
import { CodeFix, FixResult } from '@/services/CodeFixEngine';

interface FixReviewPanelProps {
  fixes: CodeFix[];
  isApplying: boolean;
  onApplyFixes: (selectedFixIds: string[]) => Promise<FixResult[]>;
}

export const FixReviewPanel: React.FC<FixReviewPanelProps> = ({
  fixes,
  isApplying,
  onApplyFixes
}) => {
  const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
  const [appliedResults, setAppliedResults] = useState<FixResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFixSelection = (fixId: string, checked: boolean) => {
    const newSelected = new Set(selectedFixes);
    if (checked) {
      newSelected.add(fixId);
    } else {
      newSelected.delete(fixId);
    }
    setSelectedFixes(newSelected);
  };

  const handleSelectAll = () => {
    const autoFixableFixes = fixes.filter(fix => fix.isAutoFixable);
    setSelectedFixes(new Set(autoFixableFixes.map(fix => fix.id)));
  };

  const handleDeselectAll = () => {
    setSelectedFixes(new Set());
  };

  const handleApplyFixes = async () => {
    if (selectedFixes.size === 0) return;
    
    setShowResults(false);
    const results = await onApplyFixes(Array.from(selectedFixes));
    setAppliedResults(results);
    setShowResults(true);
    
    // Clear selection after applying
    setSelectedFixes(new Set());
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (fixes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Code Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No fixable issues found.</p>
            <p className="text-sm">Run an analysis to discover potential fixes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const autoFixableFixes = fixes.filter(fix => fix.isAutoFixable);
  const manualFixes = fixes.filter(fix => !fix.isAutoFixable);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Code Fixes ({fixes.length} found)
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{autoFixableFixes.length} auto-fixable</span>
            <span>•</span>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>{manualFixes.length} manual review needed</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          {autoFixableFixes.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApplyFixes}
                disabled={selectedFixes.size === 0 || isApplying}
                size="sm"
              >
                Apply Selected Fixes ({selectedFixes.size})
              </Button>
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                disabled={isApplying}
              >
                Select All Auto-Fixable
              </Button>
              <Button
                onClick={handleDeselectAll}
                variant="ghost"
                size="sm"
                disabled={isApplying}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Auto-fixable Issues */}
          {autoFixableFixes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Auto-Fixable Issues
              </h4>
              {autoFixableFixes.map((fix) => (
                <Card key={fix.id} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedFixes.has(fix.id)}
                        onCheckedChange={(checked) => 
                          handleFixSelection(fix.id, checked as boolean)
                        }
                        disabled={isApplying}
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(fix.severity)}
                          <span className="font-medium">{fix.title}</span>
                          <Badge variant="outline">{fix.type}</Badge>
                          <Badge className={getImpactColor(fix.estimatedImpact)}>
                            {fix.estimatedImpact} impact
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {fix.description}
                        </p>
                        
                        {fix.filePath && (
                          <p className="text-xs text-muted-foreground">
                            📁 {fix.filePath}
                            {fix.line && ` (line ${fix.line})`}
                          </p>
                        )}

                        {/* Code Diff */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Code className="h-4 w-4" />
                            Code Changes
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-red-600 mb-1">Before:</div>
                              <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto border-l-2 border-red-300">
                                {fix.originalCode}
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-green-600 mb-1">After:</div>
                              <pre className="bg-green-50 p-2 rounded text-xs overflow-x-auto border-l-2 border-green-300">
                                {fix.fixedCode}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Manual Review Issues */}
          {manualFixes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Manual Review Required
                </h4>
                {manualFixes.map((fix) => (
                  <Card key={fix.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(fix.severity)}
                          <span className="font-medium">{fix.title}</span>
                          <Badge variant="outline">{fix.type}</Badge>
                          <Badge className={getImpactColor(fix.estimatedImpact)}>
                            {fix.estimatedImpact} impact
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {fix.description}
                        </p>
                        
                        {fix.filePath && (
                          <p className="text-xs text-muted-foreground">
                            📁 {fix.filePath}
                            {fix.line && ` (line ${fix.line})`}
                          </p>
                        )}

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            This issue requires manual review. Please examine the code and apply fixes manually.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {showResults && appliedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Fix Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appliedResults.map((result, index) => {
              const fix = fixes.find(f => f.id === result.fixId);
              return (
                <div
                  key={result.fixId}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {fix?.title || `Fix ${index + 1}`}
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                    {result.success && (
                      <div className="text-sm text-green-600">
                        Successfully applied fix
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

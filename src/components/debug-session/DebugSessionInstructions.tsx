import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Rocket } from 'lucide-react';
export const DebugSessionInstructions = () => <>
    <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
      <Rocket className="h-4 w-4" />
      <AlertTitle>How to Use the Multi-Tool Analyzer</AlertTitle>
      <AlertDescription>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Clear the editor below and paste your actual JavaScript/TypeScript code that needs debugging.</li>
          <li>Select the specific debugging tools you want to run based on what issues you're looking for.</li>
          <li>Click the <strong>Analyze</strong> button to run your selected tools on your code.</li>
          <li>Review the detailed results in the "Analysis Result" panel to identify and fix issues.</li>
          <li>Team members can collaborate in real-time - all changes and results are shared instantly.</li>
        </ol>
      </AlertDescription>
    </Alert>

    
  </>;
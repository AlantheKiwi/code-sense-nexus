
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Rocket } from 'lucide-react';

export const DebugSessionInstructions = () => (
  <>
    <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
      <Rocket className="h-4 w-4" />
      <AlertTitle>How to Use the Multi-Tool Analyzer</AlertTitle>
      <AlertDescription>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>The editor below is pre-filled with sample code. You can also paste your own.</li>
          <li>Select the debugging tools you want to use from the tool selection interface.</li>
          <li>Click the <strong>Analyze</strong> button to run your selected tools.</li>
          <li>The results will appear in the "Analysis Result" panel with findings from all tools.</li>
          <li>Collaborate with your team in real-time! Changes are synced automatically.</li>
        </ol>
      </AlertDescription>
    </Alert>

    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Secure Multi-Tool Analysis</AlertTitle>
      <AlertDescription>
        This platform uses static analysis to check your code for issues across multiple categories. No code is executed on the server.
      </AlertDescription>
    </Alert>
  </>
);

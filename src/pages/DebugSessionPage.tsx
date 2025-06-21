
import { AutoFixProvider } from '@/contexts/AutoFixProvider';
import DebugSessionContent from '@/components/debug-session/DebugSessionContent';

const DebugSessionPage = () => {
  console.log('DebugSessionPage wrapper rendering');
  
  try {
    return (
      <AutoFixProvider>
        <DebugSessionContent />
      </AutoFixProvider>
    );
  } catch (providerError) {
    console.error('Error in AutoFixProvider:', providerError);
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Application Error</h2>
        <p className="mb-4">There was an error initializing the debug session</p>
        <p className="text-sm text-gray-600">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }
};

export default DebugSessionPage;

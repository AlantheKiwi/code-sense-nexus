
import { useContext } from 'react';
import { AutoFixContext, AutoFixContextType } from '@/contexts/AutoFixContext';

export function useAutoFix(): AutoFixContextType {
  const context = useContext(AutoFixContext);
  
  if (!context) {
    throw new Error('useAutoFix must be used within an AutoFixProvider');
  }
  
  return context;
}

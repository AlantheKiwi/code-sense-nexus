import React, { useReducer, useMemo, ReactNode } from 'react';
import { AutoFixContext, AutoFixState, AutoFixActions, initialState } from './AutoFixContext';

type AutoFixAction =
  | { type: 'START_ANALYSIS'; tool: string }
  | { type: 'STOP_ANALYSIS' }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'ADD_ERROR'; error: string }
  | { type: 'ADD_RESULT'; result: any }
  | { type: 'CLEAR_STATE' };

function autoFixReducer(state: AutoFixState, action: AutoFixAction): AutoFixState {
  switch (action.type) {
    case 'START_ANALYSIS':
      return {
        ...state,
        isRunning: true,
        currentTool: action.tool,
        progress: 0,
        errors: [],
        results: []
      };
    case 'STOP_ANALYSIS':
      return {
        ...state,
        isRunning: false,
        currentTool: null,
        progress: 100
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: Math.max(0, Math.min(100, action.progress))
      };
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.error]
      };
    case 'ADD_RESULT':
      return {
        ...state,
        results: [...state.results, action.result]
      };
    case 'CLEAR_STATE':
      return initialState;
    default:
      return state;
  }
}

interface AutoFixProviderProps {
  children: ReactNode;
}

export const AutoFixProvider = ({ children }: AutoFixProviderProps) => {
  const [state, dispatch] = useReducer(autoFixReducer, initialState);

  const actions: AutoFixActions = useMemo(() => ({
    startAnalysis: (tool: string) => {
      console.log('AutoFix: Starting analysis with tool:', tool);
      dispatch({ type: 'START_ANALYSIS', tool });
    },
    stopAnalysis: () => {
      console.log('AutoFix: Stopping analysis');
      dispatch({ type: 'STOP_ANALYSIS' });
    },
    setProgress: (progress: number) => {
      dispatch({ type: 'SET_PROGRESS', progress });
    },
    addError: (error: string) => {
      console.error('AutoFix Error:', error);
      dispatch({ type: 'ADD_ERROR', error });
    },
    addResult: (result: any) => {
      console.log('AutoFix: Adding result:', result);
      dispatch({ type: 'ADD_RESULT', result });
    },
    clearState: () => {
      console.log('AutoFix: Clearing state');
      dispatch({ type: 'CLEAR_STATE' });
    },
    getResults: () => {
      return state.results;
    }
  }), [state.results]);

  const value = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <AutoFixContext.Provider value={value}>
      {children}
    </AutoFixContext.Provider>
  );
};


import { createContext } from 'react';

export interface AutoFixState {
  isRunning: boolean;
  currentTool: string | null;
  progress: number;
  errors: string[];
  results: any[];
}

export interface AutoFixActions {
  startAnalysis: (tool: string) => void;
  stopAnalysis: () => void;
  setProgress: (progress: number) => void;
  addError: (error: string) => void;
  addResult: (result: any) => void;
  clearState: () => void;
}

export interface AutoFixContextType {
  state: AutoFixState;
  actions: AutoFixActions;
}

export const initialState: AutoFixState = {
  isRunning: false,
  currentTool: null,
  progress: 0,
  errors: [],
  results: []
};

export const AutoFixContext = createContext<AutoFixContextType | null>(null);

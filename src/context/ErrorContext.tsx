import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { ErrorNotification, ConnectionState } from '../services/types';

// Action types
type ErrorAction =
  | { type: 'ADD_ERROR'; payload: ErrorNotification }
  | { type: 'REMOVE_ERROR'; payload: number }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'UPDATE_CONNECTION_STATE'; payload: ConnectionState };

// State interface
interface ErrorState {
  errors: ErrorNotification[];
  connectionState: ConnectionState;
}

// Context interface
interface ErrorContextType extends ErrorState {
  addError: (error: Omit<ErrorNotification, 'timestamp'>) => void;
  removeError: (timestamp: number) => void;
  clearErrors: () => void;
  updateConnectionState: (state: ConnectionState) => void;
  retryConnection: () => void;
}

const initialState: ErrorState = {
  errors: [],
  connectionState: {
    isConnected: false,
    isReconnecting: false,
    lastError: null,
    retryCount: 0
  }
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload]
      };
    
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.timestamp !== action.payload)
      };
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };
    
    case 'UPDATE_CONNECTION_STATE':
      return {
        ...state,
        connectionState: action.payload
      };
    
    default:
      return state;
  }
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: Omit<ErrorNotification, 'timestamp'>) => {
    const fullError: ErrorNotification = {
      ...error,
      timestamp: Date.now()
    };
    dispatch({ type: 'ADD_ERROR', payload: fullError });

    // Auto-remove non-critical errors after 10 seconds
    if (error.type !== 'signalr_error') {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: fullError.timestamp });
      }, 10000);
    }
  }, []);

  const removeError = useCallback((timestamp: number) => {
    dispatch({ type: 'REMOVE_ERROR', payload: timestamp });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const updateConnectionState = useCallback((connectionState: ConnectionState) => {
    dispatch({ type: 'UPDATE_CONNECTION_STATE', payload: connectionState });
  }, []);

  const retryConnection = useCallback(() => {
    // This will be implemented to trigger reconnection
    console.log('Retrying connection...');
  }, []);

  const value: ErrorContextType = {
    ...state,
    addError,
    removeError,
    clearErrors,
    updateConnectionState,
    retryConnection
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

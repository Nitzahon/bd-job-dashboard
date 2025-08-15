import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ConnectionState } from '../services/types';
import { JobProgressUpdate } from '../types';

// Not currently in use

interface UseSignalRConfig {
  hubUrl: string;
  autoConnect?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  backoffMultiplier?: number;
}

interface UseSignalRReturn {
  connection: HubConnection | null;
  connectionState: ConnectionState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  onProgressUpdate: (callback: (update: JobProgressUpdate) => void) => () => void;
  isConnected: boolean;
}

export function useSignalR(config: UseSignalRConfig): UseSignalRReturn {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    lastError: null,
    retryCount: 0
  });

  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressCallbacksRef = useRef<((update: JobProgressUpdate) => void)[]>([]);

  const connect = useCallback(async () => {
    if (connection?.state === 'Connected') return;

    try {
      const newConnection = new HubConnectionBuilder()
        .withUrl(config.hubUrl)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            return Math.min(
              (config.retryDelay || 2000) * Math.pow(config.backoffMultiplier || 2, retryContext.previousRetryCount),
              30000
            );
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      newConnection.on('UpdateJobProgress', (update: JobProgressUpdate) => {
        progressCallbacksRef.current.forEach(callback => callback(update));
      });

      newConnection.onclose(() => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          lastError: 'Connection closed'
        }));
      });

      newConnection.onreconnecting(() => {
        setConnectionState(prev => ({
          ...prev,
          isReconnecting: true,
          lastError: null
        }));
      });

      newConnection.onreconnected(() => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isReconnecting: false,
          retryCount: 0,
          lastError: null
        }));
      });

      await newConnection.start();
      setConnection(newConnection);
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        lastError: null
      }));

    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown SignalR error',
        retryCount: prev.retryCount + 1
      }));
    }
  }, [config.hubUrl, config.retryDelay, config.backoffMultiplier, connection]);

  const disconnect = useCallback(async () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (connection) {
      try {
        await connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      setConnection(null);
    }

    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isReconnecting: false
    }));
  }, [connection]);

  const onProgressUpdate = useCallback((callback: (update: JobProgressUpdate) => void) => {
    progressCallbacksRef.current.push(callback);
    
    return () => {
      progressCallbacksRef.current = progressCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (config.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [config.autoConnect, connect, disconnect]);

  return {
    connection,
    connectionState,
    connect,
    disconnect,
    onProgressUpdate,
    isConnected: connectionState.isConnected
  };
}

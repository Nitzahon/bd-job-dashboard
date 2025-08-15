import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Job, CreateJobRequest, ApiResponse, JobProgressUpdate, JobStatus } from '../types';
import { IJobService, ServiceConfig, RetryConfig, ConnectionState } from './types';

export class RealJobService implements IJobService {
  private hubConnection: HubConnection | null = null;
  private config: ServiceConfig;
  private retryConfig: RetryConfig;
  private connectionState: ConnectionState;
  private progressCallbacks: ((update: JobProgressUpdate) => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: ServiceConfig, retryConfig: RetryConfig = {
    maxRetries: 5,
    retryDelay: 1000,
    backoffMultiplier: 2
  }) {
    this.config = config;
    this.retryConfig = retryConfig;
    this.connectionState = {
      isConnected: false,
      isReconnecting: false,
      lastError: null,
      retryCount: 0
    };

    this.initializeSignalR();
  }

  // REST API Implementation
  async getJobs(): Promise<Job[]> {
    return this.apiCall<Job[]>('GET', '/Jobs');
  }

  async createJob(request: CreateJobRequest): Promise<Job> {
    return this.apiCall<Job>('POST', '/Jobs', request);
  }

  async stopJob(jobID: string): Promise<ApiResponse> {
    return this.apiCall<ApiResponse>('POST', `/Jobs/${jobID}/stop`);
  }

  async restartJob(jobID: string): Promise<ApiResponse> {
    return this.apiCall<ApiResponse>('POST', `/Jobs/${jobID}/restart`);
  }

  async deleteJob(jobID: string): Promise<void> {
    await this.apiCall<void>('DELETE', `/Jobs/${jobID}`);
  }

  async deleteJobsByStatus(status: JobStatus): Promise<void> {
    await this.apiCall<void>('DELETE', `/Jobs/status/${status}`);
  }

  // SignalR Implementation
  onProgressUpdate(callback: (update: JobProgressUpdate) => void): () => void {
    this.progressCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      this.hubConnection = null;
    }
    
    this.connectionState.isConnected = false;
    this.connectionState.isReconnecting = false;
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Private Methods
  private async initializeSignalR(): Promise<void> {
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.config.signalRHubUrl)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            return Math.min(this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.hubConnection.on('UpdateJobProgress', (update: JobProgressUpdate) => {
        this.progressCallbacks.forEach(callback => callback(update));
      });

      this.hubConnection.onclose(() => {
        this.connectionState.isConnected = false;
        this.connectionState.lastError = 'Connection closed';
        this.scheduleReconnect();
      });

      this.hubConnection.onreconnecting(() => {
        this.connectionState.isReconnecting = true;
        this.connectionState.lastError = null;
      });

      this.hubConnection.onreconnected(() => {
        this.connectionState.isConnected = true;
        this.connectionState.isReconnecting = false;
        this.connectionState.retryCount = 0;
        this.connectionState.lastError = null;
      });

      // Start connection
      await this.hubConnection.start();
      this.connectionState.isConnected = true;
      this.connectionState.lastError = null;
      
    } catch (error) {
      this.connectionState.lastError = error instanceof Error ? error.message : 'Unknown SignalR error';
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.connectionState.retryCount >= this.retryConfig.maxRetries) {
      this.connectionState.lastError = 'Max reconnection attempts reached';
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, this.connectionState.retryCount);
    
    this.reconnectTimer = setTimeout(async () => {
      this.connectionState.retryCount++;
      await this.initializeSignalR();
    }, delay);
  }

  private async apiCall<T>(method: string, endpoint: string, body?: any): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    let retryCount = 0;

    while (retryCount <= this.retryConfig.maxRetries) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle empty responses (like DELETE)
        if (response.status === 204 || method === 'DELETE') {
          return undefined as T;
        }

        return await response.json();
        
      } catch (error) {
        retryCount++;
        
        if (retryCount > this.retryConfig.maxRetries) {
          throw new Error(`API call failed after ${this.retryConfig.maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Wait before retry with exponential backoff
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('API call failed');
  }
}

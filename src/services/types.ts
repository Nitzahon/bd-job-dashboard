import { Job, CreateJobRequest, ApiResponse, JobProgressUpdate } from '../types';

export interface IJobService {
  // REST API methods
  getJobs(): Promise<Job[]>;
  createJob(request: CreateJobRequest): Promise<Job>;
  stopJob(jobID: string): Promise<ApiResponse>;
  restartJob(jobID: string): Promise<ApiResponse>;
  deleteJob(jobID: string): Promise<void>;
  deleteJobsByStatus(status: number): Promise<void>;
  
  // SignalR methods
  onProgressUpdate(callback: (update: JobProgressUpdate) => void): () => void;
  disconnect(): Promise<void>;
}

export interface ServiceConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  useMockData: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastError: string | null;
  retryCount: number;
}

export interface ErrorNotification {
  type: 'api_error' | 'signalr_error' | 'network_error';
  message: string;
  timestamp: number;
  canRetry: boolean;
  action?: () => void;
}

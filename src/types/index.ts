// Job Status Enumeration
export enum JobStatus {
  Pending = 0,
  InQueue = 1,
  Running = 2,
  Completed = 3,
  Failed = 4,
  Stopped = 5
}

// Job Priority Enumeration
export enum JobPriority {
  Regular = 0,
  High = 1
}

// Main Job Interface
export interface Job {
  jobID: string; // GUID
  name: string;
  status: JobStatus;
  priority: JobPriority;
  progress: number; // 0-100
  createdAt: number; // Unix timestamp
  startedAt: number; // Unix timestamp (0 if not started)
  completedAt: number; // Unix timestamp (0 if not completed)
  errorMessage: string | null;
}

// Create Job Request Interface
export interface CreateJobRequest {
  name: string;
  priority: JobPriority;
}

// API Response Interface
export interface ApiResponse {
  isSuccess: boolean;
  message: string;
}

// Job Progress Update Interface (SignalR)
export interface JobProgressUpdate {
  jobID: string;
  status: JobStatus;
  progress: number;
}

// Job Status Counts for Dashboard Cards
export interface JobStatusCounts {
  pending: number;
  inQueue: number;
  running: number;
  completed: number;
  failed: number;
  stopped: number;
}

// Filter and Sort Types
export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'priority' | 'status' | 'progress' | 'createdAt' | 'startedAt' | 'completedAt';

export interface JobTableFilters {
  status?: JobStatus;
  searchTerm?: string;
}

export interface JobTableSort {
  field: SortField;
  direction: SortDirection;
}

// Service Configuration
export interface ServiceConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  useMockData: boolean;
}

// UI State Types
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'delete' | 'bulkDelete' | null;
  data?: any;
}

// Action Types for Job Operations
export type JobAction = 'delete' | 'restart' | 'stop';

// Localization
export type Language = 'en' | 'he';
export type Direction = 'ltr' | 'rtl';

export interface LocalizationConfig {
  language: Language;
  direction: Direction;
}

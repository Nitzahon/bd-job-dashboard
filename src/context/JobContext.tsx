import React, { createContext, useContext, useEffect, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { Job, JobStatus, JobStatusCounts, JobTableFilters, JobTableSort, CreateJobRequest, ModalState, JobProgressUpdate } from '../types';
import { JobServiceFactory } from '../services/jobServiceFactory';
import { IJobService } from '../services/types';
import { useError } from './ErrorContext';

// Action types for reducer
type JobAction =
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: { jobID: string; updates: Partial<Job> } }
  | { type: 'REMOVE_JOB'; payload: string }
  | { type: 'REMOVE_JOBS_BY_STATUS'; payload: JobStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: JobTableFilters }
  | { type: 'UPDATE_FILTERS'; payload: (prev: JobTableFilters) => JobTableFilters }
  | { type: 'SET_SORT'; payload: JobTableSort }
  | { type: 'SET_MODAL'; payload: ModalState };

// State interface
interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobTableFilters;
  sort: JobTableSort;
  modal: ModalState;
}

// Context interface
interface JobContextType extends JobState {
  // Job operations
  refreshJobs: () => Promise<void>;
  createJob: (request: CreateJobRequest) => Promise<void>;
  stopJob: (jobID: string) => Promise<void>;
  restartJob: (jobID: string) => Promise<void>;
  deleteJob: (jobID: string) => Promise<void>;
  deleteJobsByStatus: (status: JobStatus) => Promise<void>;
  
  // UI operations
  setFilters: (filters: JobTableFilters | ((prev: JobTableFilters) => JobTableFilters)) => void;
  setSort: (sort: JobTableSort) => void;
  setModal: (modal: ModalState) => void;
  
  // Computed values
  filteredJobs: Job[];
  statusCounts: JobStatusCounts;
  hasActiveFilters: boolean;
}

// Initial state
const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  modal: { isOpen: false, type: null }
};

// Reducer
function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, loading: false, error: null };
    
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.jobID === action.payload.jobID 
            ? { ...job, ...action.payload.updates }
            : job
        )
      };
    
    case 'REMOVE_JOB':
      return { ...state, jobs: state.jobs.filter(job => job.jobID !== action.payload) };
    
    case 'REMOVE_JOBS_BY_STATUS':
      return { ...state, jobs: state.jobs.filter(job => job.status !== action.payload) };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'UPDATE_FILTERS':
      return { ...state, filters: action.payload(state.filters) };
    
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    
    case 'SET_MODAL':
      return { ...state, modal: action.payload };
    
    default:
      return state;
  }
}

// Create context
const JobContext = createContext<JobContextType | undefined>(undefined);

// Provider component
interface JobProviderProps {
  children: ReactNode;
}

export function JobProvider({ children }: JobProviderProps): React.ReactElement {
  
  const [state, dispatch] = useReducer(jobReducer, initialState);
  const [jobService] = React.useState<IJobService>(() => JobServiceFactory.getInstance());
  const { addError } = useError();
  
  // Initialize jobs and setup real-time updates
  useEffect(() => {
    const initializeJobs = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const jobs = await jobService.getJobs();
        dispatch({ type: 'SET_JOBS', payload: jobs });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load jobs' });
        console.error('Failed to load jobs:', error);
      }
    };

    initializeJobs();

    // Setup SignalR-like real-time updates
    const unsubscribe = jobService.onProgressUpdate((update: JobProgressUpdate) => {
      dispatch({
        type: 'UPDATE_JOB',
        payload: {
          jobID: update.jobID,
          updates: { 
            status: update.status, 
            progress: update.progress 
          }
        }
      });
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      jobService.disconnect();
    };
  }, [jobService]);

  // Job operations
  const refreshJobs = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const jobs = await jobService.getJobs();
      dispatch({ type: 'SET_JOBS', payload: jobs });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh jobs';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: refreshJobs
      });
      console.error('Failed to refresh jobs:', error);
    }
  }, [jobService, addError]);

  const createJob = useCallback(async (request: CreateJobRequest) => {
    try {
      const newJob = await jobService.createJob(request);
      dispatch({ type: 'ADD_JOB', payload: newJob });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: () => createJob(request)
      });
      console.error('Failed to create job:', error);
      throw error;
    }
  }, [jobService, addError]);

  const stopJob = useCallback(async (jobID: string) => {
    try {
      const response = await jobService.stopJob(jobID);
      if (!response.isSuccess) {
        const message = response.message;
        dispatch({ type: 'SET_ERROR', payload: message });
        addError({
          type: 'api_error',
          message,
          canRetry: true,
          action: () => stopJob(jobID)
        });
        throw new Error(message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop job';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: () => stopJob(jobID)
      });
      console.error('Failed to stop job:', error);
      throw error;
    }
  }, [jobService, addError]);

  const restartJob = useCallback(async (jobID: string) => {
    try {
      const response = await jobService.restartJob(jobID);
      if (!response.isSuccess) {
        const message = response.message;
        dispatch({ type: 'SET_ERROR', payload: message });
        addError({
          type: 'api_error',
          message,
          canRetry: true,
          action: () => restartJob(jobID)
        });
        throw new Error(message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restart job';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: () => restartJob(jobID)
      });
      console.error('Failed to restart job:', error);
      throw error;
    }
  }, [jobService, addError]);

  const deleteJob = useCallback(async (jobID: string) => {
    try {
      await jobService.deleteJob(jobID);
      dispatch({ type: 'REMOVE_JOB', payload: jobID });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete job';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: () => deleteJob(jobID)
      });
      console.error('Failed to delete job:', error);
      throw error;
    }
  }, [jobService, addError]);

  const deleteJobsByStatus = useCallback(async (status: JobStatus) => {
    try {
      await jobService.deleteJobsByStatus(status);
      dispatch({ type: 'REMOVE_JOBS_BY_STATUS', payload: status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete jobs';
      dispatch({ type: 'SET_ERROR', payload: message });
      addError({
        type: 'api_error',
        message,
        canRetry: true,
        action: () => deleteJobsByStatus(status)
      });
      console.error('Failed to delete jobs:', error);
      throw error;
    }
  }, [jobService, addError]);

  // UI operations
  const setFilters = useCallback((filtersOrUpdater: JobTableFilters | ((prev: JobTableFilters) => JobTableFilters)) => {
    if (typeof filtersOrUpdater === 'function') {
      dispatch({ type: 'UPDATE_FILTERS', payload: filtersOrUpdater });
    } else {
      dispatch({ type: 'SET_FILTERS', payload: filtersOrUpdater });
    }
  }, []);

  const setSort = useCallback((sort: JobTableSort) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const setModal = useCallback((modal: ModalState) => {
    dispatch({ type: 'SET_MODAL', payload: modal });
  }, []);

  // Computed values
  const filteredJobs = React.useMemo(() => {
    let filtered = [...state.jobs];

    // Apply status filter
    if (state.filters.status !== undefined) {
      filtered = filtered.filter(job => job.status === state.filters.status);
    }

    // Apply search filter
    if (state.filters.searchTerm) {
      const searchTerm = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = state.sort;
      let aValue = a[field];
      let bValue = b[field];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [state.jobs, state.filters, state.sort]);

  const hasActiveFilters = React.useMemo((): boolean => {
    return !!(state.filters.status !== undefined || 
              (state.filters.searchTerm && state.filters.searchTerm.trim()));
  }, [state.filters]);

  const statusCounts = React.useMemo((): JobStatusCounts => {
    const counts = {
      pending: 0,
      inQueue: 0,
      running: 0,
      completed: 0,
      failed: 0,
      stopped: 0
    };

    state.jobs.forEach(job => {
      switch (job.status) {
        case JobStatus.Pending:
          counts.pending++;
          break;
        case JobStatus.InQueue:
          counts.inQueue++;
          break;
        case JobStatus.Running:
          counts.running++;
          break;
        case JobStatus.Completed:
          counts.completed++;
          break;
        case JobStatus.Failed:
          counts.failed++;
          break;
        case JobStatus.Stopped:
          counts.stopped++;
          break;
      }
    });

    return counts;
  }, [state.jobs]);

  const contextValue: JobContextType = useMemo(() => ({
    ...state,
    refreshJobs,
    createJob,
    stopJob,
    restartJob,
    deleteJob,
    deleteJobsByStatus,
    setFilters,
    setSort,
    setModal,
    filteredJobs,
    statusCounts,
    hasActiveFilters
  }), [
    state,
    refreshJobs,
    createJob,
    stopJob,
    restartJob,
    deleteJob,
    deleteJobsByStatus,
    setFilters,
    setSort,
    setModal,
    filteredJobs,
    statusCounts,
    hasActiveFilters
  ]);

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
}

// Custom hook to use the context
export function useJobs(): JobContextType {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}

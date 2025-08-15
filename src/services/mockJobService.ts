import { Job, CreateJobRequest, ApiResponse, JobProgressUpdate, JobStatus } from '../types';
import { MockDataGenerator } from '../utils/mockDataGenerator';

export class MockJobService {
  private jobs: Job[] = [];
  private progressUpdateCallbacks: ((update: JobProgressUpdate) => void)[] = [];
  private simulationIntervals: NodeJS.Timeout[] = [];

  constructor() {
    this.initializeMockData();
    this.startProgressSimulation();
  }

  private initializeMockData(): void {
    this.jobs = MockDataGenerator.generateJobs(40);
  }

  // REST API Mock Implementations
  async getJobs(): Promise<Job[]> {
    // Simulate network delay
    await this.delay(300 + Math.random() * 200);
    return [...this.jobs];
  }

  async createJob(request: CreateJobRequest): Promise<Job> {
    await this.delay(200 + Math.random() * 100);
    
    const newJob = MockDataGenerator.generateJob({
      name: request.name,
      priority: request.priority,
      status: JobStatus.Pending,
      progress: 0,
      createdAt: Date.now(),
      startedAt: 0,
      completedAt: 0,
      errorMessage: null
    });

    this.jobs.unshift(newJob); // Add to beginning of array
    
    // Simulate job progression after creation
    setTimeout(() => this.simulateJobProgression(newJob.jobID), 2000);
    
    return newJob;
  }

  async stopJob(jobID: string): Promise<ApiResponse> {
    await this.delay(150 + Math.random() * 100);
    
    const job = this.jobs.find(j => j.jobID === jobID);
    if (!job) {
      return { isSuccess: false, message: 'Job not found' };
    }

    if (job.status !== JobStatus.Running && job.status !== JobStatus.InQueue) {
      return { isSuccess: false, message: 'Job cannot be stopped in current state' };
    }

    job.status = JobStatus.Stopped;
    this.notifyProgressUpdate({ jobID, status: job.status, progress: job.progress });
    
    return { isSuccess: true, message: 'Job stopped successfully' };
  }

  async restartJob(jobID: string): Promise<ApiResponse> {
    await this.delay(150 + Math.random() * 100);
    
    const job = this.jobs.find(j => j.jobID === jobID);
    if (!job) {
      return { isSuccess: false, message: 'Job not found' };
    }

    if (job.status !== JobStatus.Failed && job.status !== JobStatus.Stopped) {
      return { isSuccess: false, message: 'Job cannot be restarted in current state' };
    }

    job.status = JobStatus.Pending;
    job.progress = 0;
    job.errorMessage = null;
    job.startedAt = 0;
    job.completedAt = 0;
    
    this.notifyProgressUpdate({ jobID, status: job.status, progress: job.progress });
    
    // Simulate job progression after restart
    setTimeout(() => this.simulateJobProgression(jobID), 3000);
    
    return { isSuccess: true, message: 'Job restarted successfully' };
  }

  async deleteJob(jobID: string): Promise<void> {
    await this.delay(100 + Math.random() * 50);
    
    const jobIndex = this.jobs.findIndex(j => j.jobID === jobID);
    if (jobIndex !== -1) {
      this.jobs.splice(jobIndex, 1);
    }
  }

  async deleteJobsByStatus(status: JobStatus): Promise<void> {
    await this.delay(200 + Math.random() * 100);
    
    this.jobs = this.jobs.filter(job => job.status !== status);
  }

  // SignalR Mock Implementation
  onProgressUpdate(callback: (update: JobProgressUpdate) => void): () => void {
    this.progressUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.progressUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressUpdateCallbacks.splice(index, 1);
      }
    };
  }

  async disconnect(): Promise<void> {
    // Clear all intervals
    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
    
    // Clear callbacks
    this.progressUpdateCallbacks = [];
  }

  private notifyProgressUpdate(update: JobProgressUpdate): void {
    this.progressUpdateCallbacks.forEach(callback => callback(update));
  }

  private startProgressSimulation(): void {
    // Simulate running jobs progressing
    const progressInterval = setInterval(() => {
      const runningJobs = this.jobs.filter(job => job.status === JobStatus.Running);
      
      runningJobs.forEach(job => {
        if (job.progress < 100) {
          // Random progress increment
          const increment = Math.random() * 5 + 1;
          job.progress = Math.min(100, job.progress + increment);
          
          this.notifyProgressUpdate({
            jobID: job.jobID,
            status: job.status,
            progress: Math.floor(job.progress)
          });

          // Complete job when reaching 100%
          if (job.progress >= 100) {
            const shouldFail = Math.random() < 0.1; // 10% chance to fail
            job.status = shouldFail ? JobStatus.Failed : JobStatus.Completed;
            job.completedAt = Date.now();
            
            if (shouldFail) {
              job.progress = Math.floor(Math.random() * 20 + 70); // Failed between 70-90%
              job.errorMessage = MockDataGenerator['getRandomErrorMessage']();
            }

            this.notifyProgressUpdate({
              jobID: job.jobID,
              status: job.status,
              progress: job.progress
            });
          }
        }
      });
    }, 2000);

    this.simulationIntervals.push(progressInterval);

    // Simulate pending jobs moving to queue and then running
    const queueInterval = setInterval(() => {
      const pendingJobs = this.jobs.filter(job => job.status === JobStatus.Pending);
      const inQueueJobs = this.jobs.filter(job => job.status === JobStatus.InQueue);
      
      // Move pending to queue
      if (pendingJobs.length > 0 && Math.random() < 0.3) {
        const job = pendingJobs[0];
        job.status = JobStatus.InQueue;
        this.notifyProgressUpdate({ jobID: job.jobID, status: job.status, progress: job.progress });
      }

      // Move queued to running
      if (inQueueJobs.length > 0 && Math.random() < 0.4) {
        const job = inQueueJobs[0];
        job.status = JobStatus.Running;
        job.startedAt = Date.now();
        this.notifyProgressUpdate({ jobID: job.jobID, status: job.status, progress: job.progress });
      }
    }, 3000);

    this.simulationIntervals.push(queueInterval);
  }

  private simulateJobProgression(jobID: string): void {
    const job = this.jobs.find(j => j.jobID === jobID);
    if (!job || job.status !== JobStatus.Pending) return;

    // Pending -> InQueue after 2-5 seconds
    setTimeout(() => {
      if (job.status === JobStatus.Pending) {
        job.status = JobStatus.InQueue;
        this.notifyProgressUpdate({ jobID, status: job.status, progress: job.progress });
        
        // InQueue -> Running after 3-7 seconds
        setTimeout(() => {
          if (job.status === JobStatus.InQueue) {
            job.status = JobStatus.Running;
            job.startedAt = Date.now();
            this.notifyProgressUpdate({ jobID, status: job.status, progress: job.progress });
          }
        }, 3000 + Math.random() * 4000);
      }
    }, 2000 + Math.random() * 3000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy(): void {
    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
    this.progressUpdateCallbacks = [];
  }
}

import { v4 as uuidv4 } from 'uuid';
import { Job, JobStatus, JobPriority } from '../types';

export class MockDataGenerator {
  private static readonly JOB_NAMES = [
    'Data Processing Pipeline',
    'Image Optimization Batch',
    'Email Marketing Campaign',
    'Database Backup',
    'Video Transcoding Task',
    'Report Generation',
    'User Analytics Export',
    'File Compression Job',
    'API Data Sync',
    'Cache Warm-up Process',
    'Log Analysis Task',
    'Security Scan',
    'Performance Test Suite',
    'Data Migration Job',
    'Notification Dispatcher'
  ];

  static generateJob(overrides?: Partial<Job>): Job {
    const now = Date.now();
    const createdAt = now - Math.random() * 86400000; // Random time in last 24 hours
    const status = overrides?.status ?? this.getRandomStatus();
    
    let startedAt = 0;
    let completedAt = 0;
    let progress = 0;

    // Set timestamps based on status
    if (status >= JobStatus.Running) {
      startedAt = createdAt + Math.random() * 3600000; // Started within an hour of creation
      progress = status === JobStatus.Running ? Math.floor(Math.random() * 100) : 100;
    }

    if (status >= JobStatus.Completed) {
      completedAt = startedAt + Math.random() * 7200000; // Completed within 2 hours of start
      progress = 100;
    }

    if (status === JobStatus.Failed) {
      progress = Math.floor(Math.random() * 80) + 10; // Failed somewhere between 10-90%
    }

    if (status === JobStatus.Stopped) {
      progress = Math.floor(Math.random() * 70) + 10; // Stopped somewhere between 10-80%
      completedAt = 0; // Reset completed time for stopped jobs
    }

    return {
      jobID: uuidv4(),
      name: this.getRandomJobName(),
      status,
      priority: Math.random() > 0.7 ? JobPriority.High : JobPriority.Regular,
      progress,
      createdAt: Math.floor(createdAt),
      startedAt: Math.floor(startedAt),
      completedAt: Math.floor(completedAt),
      errorMessage: status === JobStatus.Failed ? this.getRandomErrorMessage() : null,
      ...overrides
    };
  }

  static generateJobs(count: number): Job[] {
    const jobs: Job[] = [];
    
    // For small counts, ensure at least one of each status for demo purposes
    if (count < 6) {
      const statuses = [JobStatus.Pending, JobStatus.InQueue, JobStatus.Running, JobStatus.Completed, JobStatus.Failed, JobStatus.Stopped];
      for (let i = 0; i < Math.min(count, statuses.length); i++) {
        jobs.push(this.generateJob({ status: statuses[i] }));
      }
      
      // Fill remaining with random
      while (jobs.length < count) {
        jobs.push(this.generateJob());
      }
    } else {
      // For larger counts, use percentage distribution
      const statusDistribution = [
        { status: JobStatus.Pending, count: Math.max(1, Math.floor(count * 0.1)) },
        { status: JobStatus.InQueue, count: Math.max(1, Math.floor(count * 0.1)) },
        { status: JobStatus.Running, count: Math.floor(count * 0.4) },
        { status: JobStatus.Completed, count: Math.floor(count * 0.2) },
        { status: JobStatus.Failed, count: Math.max(1, Math.floor(count * 0.1)) },
        { status: JobStatus.Stopped, count: Math.max(1, Math.floor(count * 0.1)) }
      ];

      // Generate jobs with specific statuses
      statusDistribution.forEach(({ status, count: statusCount }) => {
        for (let i = 0; i < statusCount; i++) {
          jobs.push(this.generateJob({ status }));
        }
      });

      // Fill remaining slots with random jobs
      while (jobs.length < count) {
        jobs.push(this.generateJob());
      }
    }

    return jobs.sort((a, b) => b.createdAt - a.createdAt); // Sort by creation time, newest first
  }

  private static getRandomJobName(): string {
    const baseName = this.JOB_NAMES[Math.floor(Math.random() * this.JOB_NAMES.length)];
    const suffix = Math.floor(Math.random() * 1000);
    return `${baseName} ${suffix}`;
  }

  private static getRandomStatus(): JobStatus {
    const statuses = Object.values(JobStatus).filter(v => typeof v === 'number') as JobStatus[];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private static getRandomErrorMessage(): string {
    const errors = [
      'Connection timeout to external service',
      'Insufficient memory to complete operation',
      'Invalid input data format detected',
      'External API rate limit exceeded',
      'Database connection lost during processing',
      'File not found at specified location',
      'Permission denied accessing required resource',
      'Network connectivity issues detected',
      'Unexpected data validation error',
      'Service temporarily unavailable'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
}

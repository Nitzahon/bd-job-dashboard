import { MockJobService } from './mockJobService';
import { RealJobService } from './realJobService';
import { IJobService, ServiceConfig, RetryConfig } from './types';
import { configService } from './configService';

export class JobServiceFactory {
  private static instance: IJobService | null = null;

  static getInstance(): IJobService {
    if (!JobServiceFactory.instance) {
      JobServiceFactory.instance = JobServiceFactory.create();
    }
    return JobServiceFactory.instance!;
  }

  static create(forceRecreate: boolean = false): IJobService {
    if (forceRecreate || !JobServiceFactory.instance) {
      // Clean up existing instance
      if (JobServiceFactory.instance) {
        JobServiceFactory.instance.disconnect?.();
      }

      const config = configService.getServiceConfig();

      if (config.useMockData) {
        JobServiceFactory.instance = new MockJobService();
      } else {
        const retryConfig: RetryConfig = {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2
        };
        JobServiceFactory.instance = new RealJobService(config, retryConfig);
      }
    }

    return JobServiceFactory.instance!;
  }

  static reset(): void {
    if (JobServiceFactory.instance) {
      JobServiceFactory.instance.disconnect?.();
      JobServiceFactory.instance = null;
    }
  }

  static getCurrentConfig(): ServiceConfig {
    return configService.getServiceConfig();
  }
}

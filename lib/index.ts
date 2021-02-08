import { ActiveJob, ActiveJobProcessorAdapter } from '@enviabybus/active-job-processor';
import { CloudTasks, CloudTasksConfig, CloudTasksQueue, QueueOptions } from '@enviabybus/express-cloud-tasks';
import { NextFunction, Request, Router } from 'express';

const CLOUD_TASKS_QUEUE_NAME_MAX_LENGTH = 63;

export class ActiveJobProcessorCloudTasksAdapter implements ActiveJobProcessorAdapter {
  cloudTasksConfig: CloudTasksConfig;
  queueNamePrefix: string;

  private cloudTasks: {
    api: Router;
    addQueue(queueName: string, options?: QueueOptions | undefined): CloudTasksQueue;
};

  constructor(cloudTasksConfig: CloudTasksConfig, queueNamePrefix: string = '') {
    this.cloudTasks = CloudTasks(cloudTasksConfig);;
    this.cloudTasksConfig = cloudTasksConfig;
    this.queueNamePrefix = queueNamePrefix;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get middlewares(): ((req: Request, res: any, next: NextFunction) => void)[] {
    return [
      this.cloudTasks.api,
    ];
  }

  addJob(job: ActiveJob): void {
    this.getQueue(job).addHandler(job.name, job.perform);
  }

  performAt(date: Date, job: ActiveJob, args: unknown[] = []): void {
    this.getQueue(job).addTask(job.name, args, { scheduleTime: new Date() });
  }

  performIn(milliseconds: number, job: ActiveJob, args: unknown[] = []): void {
    this.getQueue(job).addTask(job.name, args, { scheduleTime: new Date(Date.now() + milliseconds) });
  }

  performLater(job: ActiveJob, args: unknown[] = []): void {
    this.getQueue(job).addTask(job.name, args);
  }

  jobQueues: Record<string, CloudTasksQueue> = {}

  private getQueue(job: ActiveJob): CloudTasksQueue {
    if (this.jobQueues[job.name]) { return this.jobQueues[job.name]; }

    const queueOptions: QueueOptions = {};
    const { retryConfig } = job;

    if (retryConfig) {
      const { attempts, backoff } = retryConfig;

      queueOptions.retryConfig = {
        maxAttempts: attempts,
        maxDoublings: 0,
      };
      if (typeof backoff === 'number') {
        queueOptions.retryConfig.minBackoff = queueOptions.retryConfig.maxBackoff = backoff;
      } else if (backoff.type === 'fixed') {
        queueOptions.retryConfig.minBackoff = queueOptions.retryConfig.maxBackoff = backoff.delay;
      } else {
        queueOptions.retryConfig.maxDoublings = attempts;
        queueOptions.retryConfig.minBackoff = backoff.delay;
        if (backoff.maxDelay) { queueOptions.retryConfig.maxBackoff = backoff.maxDelay; }
      }
    } else {
      queueOptions.retryConfig = { maxAttempts: 0 };
    }

    const queueName = `${this.queueNamePrefix}${job.name}`.substr(0, CLOUD_TASKS_QUEUE_NAME_MAX_LENGTH);
    const queue = this.cloudTasks.addQueue(queueName, queueOptions);
    this.jobQueues[job.name] = queue;

    return queue;
  }
}

export default ActiveJobProcessorCloudTasksAdapter;

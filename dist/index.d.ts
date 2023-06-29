import { ActiveJob, ActiveJobProcessorAdapter } from '@enviabybus/active-job-processor';
import { CloudTasksConfig, CloudTasksQueue } from '@enviabybus/express-cloud-tasks';
import { NextFunction, Request } from 'express';
export declare class ActiveJobProcessorCloudTasksAdapter implements ActiveJobProcessorAdapter {
    cloudTasksConfig: CloudTasksConfig;
    queueNamePrefix: string;
    private cloudTasks;
    constructor(cloudTasksConfig: CloudTasksConfig, queueNamePrefix?: string);
    get middlewares(): ((req: Request, res: any, next: NextFunction) => void)[];
    addJob(job: ActiveJob): void;
    performAt(date: Date, job: ActiveJob, args?: unknown[]): void;
    performIn(milliseconds: number, job: ActiveJob, args?: unknown[]): void;
    performLater(job: ActiveJob, args?: unknown[]): void;
    jobQueues: Record<string, CloudTasksQueue>;
    private getQueue;
}
export default ActiveJobProcessorCloudTasksAdapter;
//# sourceMappingURL=index.d.ts.map
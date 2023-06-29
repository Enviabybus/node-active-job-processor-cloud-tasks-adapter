"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveJobProcessorCloudTasksAdapter = void 0;
const express_cloud_tasks_1 = require("@enviabybus/express-cloud-tasks");
const CLOUD_TASKS_QUEUE_NAME_MAX_LENGTH = 63;
class ActiveJobProcessorCloudTasksAdapter {
    constructor(cloudTasksConfig, queueNamePrefix = '') {
        this.jobQueues = {};
        this.cloudTasks = express_cloud_tasks_1.CloudTasks(cloudTasksConfig);
        ;
        this.cloudTasksConfig = cloudTasksConfig;
        this.queueNamePrefix = queueNamePrefix;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get middlewares() {
        return [
            this.cloudTasks.api,
        ];
    }
    addJob(job) {
        this.getQueue(job).addHandler(job.name, job.perform);
    }
    performAt(date, job, args = []) {
        this.getQueue(job).addTask(job.name, args, { scheduleTime: new Date() });
    }
    performIn(milliseconds, job, args = []) {
        this.getQueue(job).addTask(job.name, args, { scheduleTime: new Date(Date.now() + milliseconds) });
    }
    performLater(job, args = []) {
        this.getQueue(job).addTask(job.name, args);
    }
    getQueue(job) {
        if (this.jobQueues[job.name]) {
            return this.jobQueues[job.name];
        }
        const queueOptions = {};
        const { retryConfig } = job;
        if (retryConfig) {
            const { attempts, backoff } = retryConfig;
            queueOptions.retryConfig = {
                maxAttempts: attempts,
                maxDoublings: 0,
            };
            if (typeof backoff === 'number') {
                queueOptions.retryConfig.minBackoff = queueOptions.retryConfig.maxBackoff = backoff;
            }
            else if (backoff.type === 'fixed') {
                queueOptions.retryConfig.minBackoff = queueOptions.retryConfig.maxBackoff = backoff.delay;
            }
            else {
                queueOptions.retryConfig.maxDoublings = attempts;
                queueOptions.retryConfig.minBackoff = backoff.delay;
                if (backoff.maxDelay) {
                    queueOptions.retryConfig.maxBackoff = backoff.maxDelay;
                }
            }
        }
        else {
            queueOptions.retryConfig = { maxAttempts: 1 };
        }
        const queueName = `${this.queueNamePrefix}${job.name}`.substr(0, CLOUD_TASKS_QUEUE_NAME_MAX_LENGTH);
        const queue = this.cloudTasks.addQueue(queueName, queueOptions);
        this.jobQueues[job.name] = queue;
        return queue;
    }
}
exports.ActiveJobProcessorCloudTasksAdapter = ActiveJobProcessorCloudTasksAdapter;
exports.default = ActiveJobProcessorCloudTasksAdapter;
//# sourceMappingURL=index.js.map
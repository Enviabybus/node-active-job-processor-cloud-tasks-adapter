# ActiveJobProcessor

Google Cloud Tasks adapter for ActiveJobProcessor

## How to use

```ts
// src/index.ts

import ActiveJobProcessor, { initActiveJobProcessor } from '@enviabybus/active-job-processor';
import ActiveJobProcessorCloudTasksAdapter from '@enviabybus/active-job-processor-cloud-tasks-adapter';

import PingJob from './jobs/ping.job.ts'

initActiveJobProcessor(path.resolve(__dirname, './jobs'));

const adapter = new ActiveJobProcessorCloudTasksAdapter(cloudTasksConfig, 'my-queue-');
const jobProcessor = new ActiveJobProcessor(adapter);

jobProcessor.performLater(PingJob, ['pong']);
jobProcessor.performIn(5000, PingJob, ['pong']);
jobProcessor.performAt(new Date(), PingJob, ['pong']);
```

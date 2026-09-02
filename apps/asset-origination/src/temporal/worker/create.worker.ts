import { bundleWorkflowCode,NativeConnection, Worker } from '@temporalio/worker';

import { CaseActivities } from '../activities/origination-case.activities';
import { ORIGINATION_CASE_TASK_QUEUE } from '../temporal.constants';

export interface OriginationCaseWorkerOptions {
  connection: NativeConnection;
  activities: CaseActivities;
  taskQueue?: string;
  maxConcurrentWorkflowTaskExecutions?: number;
  /**
   * Path to a pre-compiled workflow JS file/dir that Temporal loads as-is.
   * Mutually exclusive with `workflowSourceDir`.
   */
  workflowsPath?: string;
  /**
   * Path to the directory of workflow TypeScript source files, bundled at
   * runtime via {@link bundleWorkflowCode}. Works with webpack-bundled apps
   * where pre-compiled workflow files are unavailable.
   */
  workflowSourceDir?: string;
}

export async function createOriginationCaseWorker(
  options: OriginationCaseWorkerOptions,
): Promise<Worker> {
  let workflowBundle: Awaited<ReturnType<typeof bundleWorkflowCode>> | undefined;
  if (options.workflowSourceDir !== undefined) {
    workflowBundle = await bundleWorkflowCode({ workflowsPath: options.workflowSourceDir });
  }

  return Worker.create({
    connection: options.connection,
    ...(workflowBundle
      ? { workflowBundle }
      : options.workflowsPath
        ? { workflowsPath: options.workflowsPath }
        : {}),
    taskQueue: options.taskQueue ?? ORIGINATION_CASE_TASK_QUEUE,
    activities: options.activities,
    maxConcurrentWorkflowTaskExecutions: options.maxConcurrentWorkflowTaskExecutions ?? 100,
  });
}

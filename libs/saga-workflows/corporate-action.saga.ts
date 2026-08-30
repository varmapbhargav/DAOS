import {
  Workflow,
  TaskQueue,
  ChildWorkflowOptions,
  RetryPolicy,
} from '@temporalio/workflow';
import { CorporateAction } from './types';

// Child workflow options
const childOptions: ChildWorkflowOptions = {
  taskQueue: 'corporate-action-queue',
  workflowExecutionTimeout: '30 minutes',
  retry: {
    maximumAttempts: 3,
    maximumInterval: '30 seconds',
  },
};

/**
 * Corporate Action Saga orchestrates the complete corporate action process
 * from announcement through election collection and execution.
 *
 * Steps:
 * 1. Corporate Action Announced
 * 2. Election Notices (Notification)
 * 3. Collect Elections
 * 4. Process Votes
 * 5. Cap Table Update (Cap Table)
 * 6. Settlement Notification (Settlement)
 */
export async function corporateActionSaga(
  actionId: string,
  productId: string,
): Promise<void> {
  // Step 1: Election Notices
  await startChild('sendElectionNotices', {
    args: [{ actionId, productId }],
    ...childOptions,
  });

  // Step 2: Collect Elections
  const elections = await startChild('collectElections', {
    args: [{ actionId, productId }],
    ...childOptions,
  });

  // Step 3: Process Votes
  await startChild('processCorporateAction', {
    args: [{ actionId, productId, elections }],
    ...childOptions,
  });

  // Step 4: Cap Table Update
  await startChild('updateCapTableForAction', {
    args: [{ actionId, productId }],
    ...childOptions,
  });

  // Step 5: Settlement Notification
  await startChild('notifySettlement', {
    args: [{ actionId }],
    ...childOptions,
  });
}

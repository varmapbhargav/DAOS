import {
  Workflow,
  TaskQueue,
  ChildWorkflowOptions,
  RetryPolicy,
} from '@temporalio/workflow';
import { Distribution } from './types';

// Child workflow options
const childOptions: ChildWorkflowOptions = {
  taskQueue: 'distribution-payment-queue',
  workflowExecutionTimeout: '45 minutes',
  retry: {
    maximumAttempts: 3,
    maximumInterval: '1 minute',
  },
};

/**
 * Distribution & Payment Saga orchestrates the complete distribution process
 * from waterfall calculation through payment batches and notifications.
 *
 * Steps:
 * 1. Distribution Approved
 * 2. Waterfall Calculation (Waterfall Engine)
 * 3. Tax Withholding
 * 4. Payment Batch (Distribution)
 * 5. Notification (Notification)
 * 6. Cap Table Update (Cap Table)
 * 7. Statement Refresh (Reporting)
 */
export async function distributionPaymentSaga(
  distributionId: string,
  productId: string,
): Promise<void> {
  // Step 1: Waterfall Calculation
  const distributionDetails = await startChild('calculateWaterfall', {
    args: [{ distributionId, productId }],
    ...childOptions,
  });

  // Step 2: Tax Withholding
  await startChild('applyTaxWithholding', {
    args: [{ distributionId, details: distributionDetails }],
    ...childOptions,
  });

  // Step 3: Payment Batch
  const batchId = await startChild('createPaymentBatch', {
    args: [{ distributionId, details: distributionDetails }],
    ...childOptions,
  });

  // Step 4: Notification
  await startChild('sendDistributionNotices', {
    args: [{ distributionId, batchId }],
    ...childOptions,
  });

  // Step 5: Cap Table Update
  await startChild('updateCapTable', {
    args: [{ distributionId, productId }],
    ...childOptions,
  });

  // Step 6: Statement Refresh
  await startChild('generateStatements', {
    args: [{ distributionId, productId }],
    ...childOptions,
  });
}

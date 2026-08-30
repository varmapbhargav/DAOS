import {
  Workflow,
  TaskQueue,
  ChildWorkflowOptions,
  RetryPolicy,
} from '@temporalio/workflow';
import { Deal, Entity, Product, Token, CapTable, Subscription } from './types';

// Child workflow options
const childOptions: ChildWorkflowOptions = {
  taskQueue: 'deal-lifecycle-queue',
  workflowExecutionTimeout: '60 minutes',
  retry: {
    maximumAttempts: 3,
    maximumInterval: '1 minute',
  },
};

/**
 * Deal Lifecycle Saga orchestrates the end-to-end deal process
 * from approval through token minting and cap table initialization.
 *
 * Steps:
 * 1. Deal Approved
 * 2. Entity Formation (Legal Entity Studio)
 * 3. Product Activation (Product Design Studio)
 * 4. Token Mint (Issuance Studio)
 * 5. Cap Table Initialization
 * 6. Subscription Open (Distribution)
 * 7. Closing
 * 8. Listing Published (Marketplace)
 */
export async function dealLifecycleSaga(
  dealId: string,
  investorId: string,
): Promise<void> {
  const deal = await getDeal(dealId);

  // Step 1: Entity Formation
  const entityId = await startChild('formLegalEntity', {
    args: [{ dealId, createdById: investorId }],
    ...childOptions,
  });

  // Step 2: Product Activation
  const productId = await startChild('activateProduct', {
    args: [{ entityId, dealId }],
    ...childOptions,
  });

  // Step 3: Token Mint
  const tokenAddress = await startChild('tokenMint', {
    args: [{ productId, dealId }],
    ...childOptions,
  });

  // Step 4: Cap Table Initialization
  await startChild('initializeCapTable', {
    args: [{ productId }],
    ...childOptions,
  });

  // Step 5: Subscription Open
  await startChild('openSubscription', {
    args: [{ productId, dealId }],
    ...childOptions,
  });

  // Step 6: Closing
  await startChild('completeClosing', {
    args: [{ dealId, productId }],
    ...childOptions,
  });

  // Step 7: Listing Published
  await startChild('publishListing', {
    args: [{ productId }],
    ...childOptions,
  });
}

/**
 * Investor Onboarding Saga orchestrates the complete investor journey
 * from registration through KYC to wallet provisioning.
 *
 * Steps:
 * 1. Investor Registered
 * 2. KYC Submission
 * 3. Accreditation Verification
 * 4. Wallet Provisioning (Wallet & Custody)
 * 5. Whitelist Update (Issuance Studio)
 */
export async function investorOnboardingSaga(
  investorId: string,
  userId: string,
): Promise<void> {
  // Step 1: KYC Submission
  const kycId = await startChild('submitKyc', {
    args: [{ investorId, userId }],
    ...childOptions,
  });

  // Step 2: Accreditation Verification
  await startChild('verifyAccreditation', {
    args: [{ investorId, kycId }],
    ...childOptions,
  });

  // Step 3: Wallet Provisioning
  const walletId = await startChild('provisionWallet', {
    args: [{ investorId }],
    ...childOptions,
  });

  // Step 4: Whitelist Update
  await startChild('addToWhitelist', {
    args: [{ investorId, walletId }],
    ...childOptions,
  });
}

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

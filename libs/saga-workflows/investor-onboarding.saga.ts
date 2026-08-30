import {
  Workflow,
  TaskQueue,
  ChildWorkflowOptions,
  RetryPolicy,
} from '@temporalio/workflow';
import { Investor } from './types';

// Child workflow options
const childOptions: ChildWorkflowOptions = {
  taskQueue: 'investor-onboarding-queue',
  workflowExecutionTimeout: '30 minutes',
  retry: {
    maximumAttempts: 3,
    maximumInterval: '30 seconds',
  },
};

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

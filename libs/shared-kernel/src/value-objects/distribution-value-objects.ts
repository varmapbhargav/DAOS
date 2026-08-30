// Distribution Value Objects
import { Money } from '@daos/shared-kernel';

export type SubscriptionStatus =
  | 'draft'
  | 'documentsSent'
  | 'documentsExecuted'
  | 'pendingAllocation'
  | 'allocated'
  | 'funded'
  | 'rejected'
  | 'cancelled';

export type AllocationMethod = 'proRata' | 'discretionary' | 'firstComeFirstServed';

export type AllocationStatus = 'draft' | 'finalized' | 'published';

export type CapitalCallStatus = 'issued' | 'partiallyFunded' | 'funded' | 'defaulted';

export type ClosingStatus = 'scheduled' | 'open' | 'soft' | 'hard';

export type SubscriptionAllocation = {
  subscriptionId: string;
  requestedAmount: Money;
  allocatedAmount: Money;
  allocationPct: number;
};

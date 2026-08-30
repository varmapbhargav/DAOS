export interface MoneyOrmRow {
  amount: string;
  currency: string;
}

export interface SubscriptionAllocationOrmRow {
  subscriptionId: string;
  requestedAmount: MoneyOrmRow;
  allocatedAmount: MoneyOrmRow;
  allocationPct: number;
}

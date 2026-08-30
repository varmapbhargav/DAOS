import { AllocationMethod, Money, SubscriptionAllocation } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { Subscription } from '../aggregates/subscription.aggregate';

export type AllocateParams = {
  method: AllocationMethod;
  totalAmount: Money;
  subscriptions: Subscription[];
};

/**
 * Allocates the fundable amount across executed subscriptions.
 * - proRata: each subscription receives its proportional share of the total.
 * - firstComeFirstServed: subscriptions are fulfilled in receipt order until the total is exhausted.
 * - discretionary: requires a manual decision, computation is not supported here.
 */
@Injectable()
export class AllocationEngine {
  allocate(params: AllocateParams): SubscriptionAllocation[] {
    if (params.subscriptions.length === 0) return [];
    if (params.totalAmount.amount < 0n) throw new Error('Allocation total cannot be negative');

    switch (params.method) {
      case 'proRata':
        return this.proRata(params);
      case 'firstComeFirstServed':
        return this.firstComeFirstServed(params);
      case 'discretionary':
        throw new Error('Discretionary allocations require manual assignment');
      default:
        throw new Error(`Unsupported allocation method: ${params.method}`);
    }
  }

  private proRata(params: AllocateParams): SubscriptionAllocation[] {
    const { totalAmount, subscriptions } = params;
    const totalRequested = subscriptions.reduce((sum, s) => sum + s.requestedAmount.amount, 0n);
    if (totalRequested === 0n) return [];

    const currency = totalAmount.currency;
    const entries = subscriptions.map((s) => {
      const allocated = (totalAmount.amount * s.requestedAmount.amount) / totalRequested;
      const pct = (Number(allocated) / Number(totalAmount.amount)) * 100;
      return {
        subscriptionId: s.id.value,
        requestedAmount: s.requestedAmount,
        allocatedAmount: Money.of(allocated, currency),
        allocationPct: round(pct),
      } satisfies SubscriptionAllocation;
    });

    return this.distributeRemainder(entries, totalAmount, subscriptions);
  }

  private firstComeFirstServed(params: AllocateParams): SubscriptionAllocation[] {
    const { totalAmount, subscriptions } = params;
    const currency = totalAmount.currency;
    const ordered = [...subscriptions].sort((a, b) => a.getSortKey().localeCompare(b.getSortKey()));
    let remaining = totalAmount;
    const entries: SubscriptionAllocation[] = [];
    for (const s of ordered) {
      if (remaining.amount <= 0n) break;
      const granted = s.requestedAmount.amount < remaining.amount ? s.requestedAmount.amount : remaining.amount;
      entries.push({
        subscriptionId: s.id.value,
        requestedAmount: s.requestedAmount,
        allocatedAmount: Money.of(granted, currency),
        allocationPct: round((Number(granted) / Number(s.requestedAmount.amount)) * 100),
      });
      remaining = remaining.subtract(Money.of(granted, currency));
    }
    return entries;
  }

  /**
   * Distributes fractional minor-unit rounding leftovers to the largest
   * subscriptions so the allocated sum exactly matches the total.
   */
  private distributeRemainder(
    entries: SubscriptionAllocation[],
    totalAmount: Money,
    subscriptions: Subscription[],
  ): SubscriptionAllocation[] {
    const allocated = entries.reduce((sum, e) => sum + e.allocatedAmount.amount, 0n);
    let remainder = totalAmount.amount - allocated;
    if (remainder <= 0n) return entries;
    const order = [...entries]
      .map((e, i) => ({ e, i }))
      .sort((a, b) => Number(b.e.allocatedAmount.amount - a.e.allocatedAmount.amount) || a.i - b.i);
    const currency = totalAmount.currency;
    for (const idx of order) {
      if (remainder <= 0n) break;
      entries[idx.i] = {
        ...entries[idx.i],
        allocatedAmount: Money.of(entries[idx.i].allocatedAmount.amount + 1n, currency),
      };
      remainder -= 1n;
    }
    return entries;
  }
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
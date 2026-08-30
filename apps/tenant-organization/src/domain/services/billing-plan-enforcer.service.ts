import { Injectable } from '@nestjs/common';

import { ServiceEntitlement } from '../aggregates/service-entitlement.aggregate';

@Injectable()
export class BillingPlanEnforcer {
  assertWithinLimits(entitlement: ServiceEntitlement): void {
    const limits = entitlement.usageLimits;
    const usage = entitlement.currentUsage;
    this.assertUsageWithinLimits(entitlement, usage.apiCalls, usage.seatsUsed);
  }

  assertUsageWithinLimits(entitlement: ServiceEntitlement, apiCalls: number, seatsUsed: number): void {
    const limits = entitlement.usageLimits;
    if (seatsUsed > limits.seats) {
      throw new Error(`Seat limit exceeded: ${seatsUsed} > ${limits.seats}`);
    }
    if (apiCalls > limits.apiCallsPerMonth) {
      throw new Error(`API call limit exceeded: ${apiCalls} > ${limits.apiCallsPerMonth}`);
    }
  }

  seatsAvailable(entitlement: ServiceEntitlement): number {
    return Math.max(0, entitlement.usageLimits.seats - entitlement.currentUsage.seatsUsed);
  }

  apiCallsAvailable(entitlement: ServiceEntitlement): number {
    return Math.max(0, entitlement.usageLimits.apiCallsPerMonth - entitlement.currentUsage.apiCalls);
  }
}

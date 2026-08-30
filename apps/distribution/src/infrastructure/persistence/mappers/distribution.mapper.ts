import {
  AllocationId,
  AllocationMethod,
  AllocationStatus,
  CapitalCallId,
  CapitalCallStatus,
  ClosingId,
  ClosingStatus,
  Money,
  SubscriptionAllocation,
  SubscriptionId,
  SubscriptionStatus,
  TenantId,
} from '@daos/shared-kernel';

import { Allocation } from '../../../domain/aggregates/allocation.aggregate';
import { CapitalCall } from '../../../domain/aggregates/capital-call.aggregate';
import { Closing } from '../../../domain/aggregates/closing.aggregate';
import { Subscription } from '../../../domain/aggregates/subscription.aggregate';
import {
  AllocationOrmEntity,
  CapitalCallOrmEntity,
  ClosingOrmEntity,
  SubscriptionOrmEntity,
} from '../entities/distribution.orm-entities';
import { MoneyOrmRow, SubscriptionAllocationOrmRow } from '../entities/distribution.orm-rows';

export function moneyToRow(money: Money): MoneyOrmRow {
  return { amount: money.amount.toString(), currency: money.currency };
}

export function moneyFromRow(row: MoneyOrmRow): Money {
  return Money.of(BigInt(row.amount), row.currency);
}

export function subscriptionToOrm(s: Subscription): Partial<SubscriptionOrmEntity> {
  return {
    id: s.id.value,
    tenantId: s.tenantId.value,
    productId: s.productId,
    investorId: s.investorId,
    status: s.status,
    requestedAmount: moneyToRow(s.requestedAmount) as unknown as object,
    allocatedAmount: s.allocatedAmount ? (moneyToRow(s.allocatedAmount) as unknown as object) : null,
    allocationPct: s.allocationPct,
    paymentRef: s.paymentRef,
    rejectReason: s.rejectReason,
    fundedAt: s.fundedAt ? new Date(s.fundedAt) : null,
    receivedAt: new Date(s.receivedAt),
    version: s.version,
  };
}

export function subscriptionFromOrm(e: SubscriptionOrmEntity): Subscription {
  return Subscription.reconstruct({
    id: SubscriptionId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    productId: e.productId,
    investorId: e.investorId,
    requestedAmount: moneyFromRow(e.requestedAmount as MoneyOrmRow),
    status: e.status as SubscriptionStatus,
    allocatedAmount: e.allocatedAmount ? moneyFromRow(e.allocatedAmount as MoneyOrmRow) : null,
    allocationPct: e.allocationPct != null ? Number(e.allocationPct) : null,
    paymentRef: e.paymentRef,
    rejectReason: e.rejectReason,
    fundedAt: e.fundedAt ? e.fundedAt.toISOString() : null,
    receivedAt: e.receivedAt.toISOString(),
    version: e.version,
  });
}

export function allocationToOrm(a: Allocation): Partial<AllocationOrmEntity> {
  return {
    id: a.id.value,
    tenantId: a.tenantId.value,
    closingId: a.closingId,
    productId: a.productId,
    method: a.method,
    status: a.status,
    totalAmount: moneyToRow(a.totalAmount) as unknown as object,
    entries: a.entries.map(toAllocationRow) as unknown as object,
    version: a.version,
  };
}

export function allocationFromOrm(e: AllocationOrmEntity): Allocation {
  return Allocation.reconstruct({
    id: AllocationId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    closingId: e.closingId,
    productId: e.productId,
    method: e.method as AllocationMethod,
    totalAmount: moneyFromRow(e.totalAmount as MoneyOrmRow),
    entries: ((e.entries as SubscriptionAllocationOrmRow[]) ?? []).map(fromAllocationRow),
    status: e.status as AllocationStatus,
    version: e.version,
  });
}

export function capitalCallToOrm(c: CapitalCall): Partial<CapitalCallOrmEntity> {
  return {
    id: c.id.value,
    tenantId: c.tenantId.value,
    closingId: c.closingId,
    investorId: c.investorId,
    amount: moneyToRow(c.amount) as unknown as object,
    amountFunded: moneyToRow(c.amountFunded) as unknown as object,
    status: c.status,
    dueDate: c.dueDate,
    fundedAt: c.fundedAt ? new Date(c.fundedAt) : null,
    version: c.version,
  };
}

export function capitalCallFromOrm(e: CapitalCallOrmEntity): CapitalCall {
  return CapitalCall.reconstruct({
    id: CapitalCallId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    closingId: e.closingId,
    investorId: e.investorId,
    amount: moneyFromRow(e.amount as MoneyOrmRow),
    amountFunded: moneyFromRow(e.amountFunded as MoneyOrmRow),
    status: e.status as CapitalCallStatus,
    dueDate: e.dueDate,
    fundedAt: e.fundedAt ? e.fundedAt.toISOString() : null,
    version: e.version,
  });
}

export function closingToOrm(c: Closing): Partial<ClosingOrmEntity> {
  return {
    id: c.id.value,
    tenantId: c.tenantId.value,
    productId: c.productId,
    status: c.status,
    closesAt: c.closesAt,
    completedAt: c.completedAt ? new Date(c.completedAt) : null,
    version: c.version,
  };
}

export function closingFromOrm(e: ClosingOrmEntity): Closing {
  return Closing.reconstruct({
    id: ClosingId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    productId: e.productId,
    status: e.status as ClosingStatus,
    closesAt: e.closesAt,
    completedAt: e.completedAt ? e.completedAt.toISOString() : null,
    version: e.version,
  });
}

function toAllocationRow(entry: SubscriptionAllocation): SubscriptionAllocationOrmRow {
  return {
    subscriptionId: entry.subscriptionId,
    requestedAmount: moneyToRow(entry.requestedAmount),
    allocatedAmount: moneyToRow(entry.allocatedAmount),
    allocationPct: entry.allocationPct,
  };
}

function fromAllocationRow(row: SubscriptionAllocationOrmRow): SubscriptionAllocation {
  return {
    subscriptionId: row.subscriptionId,
    requestedAmount: moneyFromRow(row.requestedAmount),
    allocatedAmount: moneyFromRow(row.allocatedAmount),
    allocationPct: row.allocationPct,
  };
}

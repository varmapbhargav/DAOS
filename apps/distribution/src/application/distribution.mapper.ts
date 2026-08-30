import {
  AllocationMethod,
  AllocationStatus,
  CapitalCallStatus,
  ClosingStatus,
  Money,
  SubscriptionAllocation,
  SubscriptionStatus,
} from '@daos/shared-kernel';

import { Allocation } from '../domain/aggregates/allocation.aggregate';
import { CapitalCall } from '../domain/aggregates/capital-call.aggregate';
import { Closing } from '../domain/aggregates/closing.aggregate';
import { Subscription } from '../domain/aggregates/subscription.aggregate';
import { toMoneyDto } from './money.mapper';

export interface SubscriptionDto {
  id: string;
  tenantId: string;
  productId: string;
  investorId: string;
  status: SubscriptionStatus;
  requestedAmount: { amount: string; currency: string };
  allocatedAmount: { amount: string; currency: string } | null;
  allocationPct: number | null;
  paymentRef: string | null;
  rejectReason: string | null;
  fundedAt: string | null;
  receivedAt: string;
  version: number;
}

export interface SubscriptionAllocationDto {
  subscriptionId: string;
  requestedAmount: { amount: string; currency: string };
  allocatedAmount: { amount: string; currency: string };
  allocationPct: number;
}

export interface AllocationDto {
  id: string;
  tenantId: string;
  closingId: string;
  productId: string;
  method: AllocationMethod;
  status: AllocationStatus;
  totalAmount: { amount: string; currency: string };
  entries: SubscriptionAllocationDto[];
  version: number;
}

export interface CapitalCallDto {
  id: string;
  tenantId: string;
  closingId: string;
  investorId: string;
  amount: { amount: string; currency: string };
  amountFunded: { amount: string; currency: string };
  status: CapitalCallStatus;
  dueDate: string;
  fundedAt: string | null;
  version: number;
}

export interface ClosingDto {
  id: string;
  tenantId: string;
  productId: string;
  status: ClosingStatus;
  closesAt: string;
  completedAt: string | null;
  version: number;
}

export interface FundraisingProgressDto {
  productId: string;
  subscriptionCount: number;
  totalRequested: { amount: string; currency: string };
  totalAllocated: { amount: string; currency: string };
  totalFunded: { amount: string; currency: string };
  fundedPct: number;
}

export function toSubscriptionDto(subscription: Subscription): SubscriptionDto {
  return {
    id: subscription.id.value,
    tenantId: subscription.tenantId.value,
    productId: subscription.productId,
    investorId: subscription.investorId,
    status: subscription.status,
    requestedAmount: toMoneyDto(subscription.requestedAmount),
    allocatedAmount: subscription.allocatedAmount ? toMoneyDto(subscription.allocatedAmount) : null,
    allocationPct: subscription.allocationPct,
    paymentRef: subscription.paymentRef,
    rejectReason: subscription.rejectReason,
    fundedAt: subscription.fundedAt,
    receivedAt: subscription.receivedAt,
    version: subscription.version,
  };
}

function toAllocationEntryDto(entry: SubscriptionAllocation): SubscriptionAllocationDto {
  return {
    subscriptionId: entry.subscriptionId,
    requestedAmount: toMoneyDto(entry.requestedAmount),
    allocatedAmount: toMoneyDto(entry.allocatedAmount),
    allocationPct: entry.allocationPct,
  };
}

export function toAllocationDto(allocation: Allocation): AllocationDto {
  return {
    id: allocation.id.value,
    tenantId: allocation.tenantId.value,
    closingId: allocation.closingId,
    productId: allocation.productId,
    method: allocation.method,
    status: allocation.status,
    totalAmount: toMoneyDto(allocation.totalAmount),
    entries: allocation.entries.map(toAllocationEntryDto),
    version: allocation.version,
  };
}

export function toCapitalCallDto(call: CapitalCall): CapitalCallDto {
  return {
    id: call.id.value,
    tenantId: call.tenantId.value,
    closingId: call.closingId,
    investorId: call.investorId,
    amount: toMoneyDto(call.amount),
    amountFunded: toMoneyDto(call.amountFunded),
    status: call.status,
    dueDate: call.dueDate,
    fundedAt: call.fundedAt,
    version: call.version,
  };
}

export function toClosingDto(closing: Closing): ClosingDto {
  return {
    id: closing.id.value,
    tenantId: closing.tenantId.value,
    productId: closing.productId,
    status: closing.status,
    closesAt: closing.closesAt,
    completedAt: closing.completedAt,
    version: closing.version,
  };
}

export function toFundraisingProgressDto(input: {
  productId: string;
  subscriptions: Subscription[];
  accumulated: { allocated: Money; funded: Money };
}): FundraisingProgressDto {
  const { productId, subscriptions, accumulated } = input;
  const totalRequested = subscriptions.reduce((sum, s) => sum.add(s.requestedAmount), Money.zero('USD'));
  const fundedPct = totalRequested.amount > 0n ? Number((accumulated.funded.amount * 10000n) / totalRequested.amount) / 100 : 0;
  return {
    productId,
    subscriptionCount: subscriptions.length,
    totalRequested: toMoneyDto(totalRequested),
    totalAllocated: toMoneyDto(accumulated.allocated),
    totalFunded: toMoneyDto(accumulated.funded),
    fundedPct: Math.round(fundedPct * 100) / 100,
  };
}
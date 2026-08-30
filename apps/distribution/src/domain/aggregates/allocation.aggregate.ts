import { AggregateRoot, AllocationId, AllocationMethod, AllocationStatus, Money, SubscriptionAllocation, TenantId } from '@daos/shared-kernel';

import { AllocationApproved } from '../events/allocation-approved.event';

export type CreateAllocationParams = {
  tenantId: TenantId;
  closingId: string;
  productId: string;
  method: AllocationMethod;
  totalAmount: Money;
};

export class Allocation extends AggregateRoot {
  private constructor(
    public readonly id: AllocationId,
    public readonly tenantId: TenantId,
    private _closingId: string,
    private _productId: string,
    private _method: AllocationMethod,
    private _totalAmount: Money,
    private _entries: SubscriptionAllocation[],
    private _status: AllocationStatus,
  ) {
    super();
  }

  static create(params: CreateAllocationParams): Allocation {
    const allocation = new Allocation(
      AllocationId.create(),
      params.tenantId,
      params.closingId,
      params.productId,
      params.method,
      params.totalAmount,
      [],
      'draft',
    );
    allocation.incrementVersion();
    return allocation;
  }

  setEntries(entries: SubscriptionAllocation[]): void {
    if (this._status !== 'draft') throw new Error('Only draft allocations can be updated');
    const allocated = entries.reduce((sum, e) => sum + e.allocatedAmount.amount, 0n);
    if (allocated !== this._totalAmount.amount) {
      throw new Error('Allocated total must equal the allocation totalAmount');
    }
    this._entries = entries.map((e) => ({ ...e }));
    this.incrementVersion();
  }

  finalize(): void {
    if (this._status !== 'draft') throw new Error('Only draft allocations can be finalized');
    if (this._entries.length === 0) throw new Error('Cannot finalize an allocation with no entries');
    this._status = 'finalized';
    for (const entry of this._entries) {
      this.raise(
        new AllocationApproved(
          this.id.value,
          this.tenantId.value,
          entry.subscriptionId,
          entry.requestedAmount,
          entry.allocatedAmount,
          entry.allocationPct,
        ),
      );
    }
    this.incrementVersion();
  }

  publish(): void {
    if (this._status !== 'finalized') throw new Error('Only finalized allocations can be published');
    this._status = 'published';
    this.incrementVersion();
  }

  get closingId(): string {
    return this._closingId;
  }

  get productId(): string {
    return this._productId;
  }

  get method(): AllocationMethod {
    return this._method;
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  get entries(): SubscriptionAllocation[] {
    return this._entries.map((e) => ({ ...e, requestedAmount: e.requestedAmount, allocatedAmount: e.allocatedAmount }));
  }

  get status(): AllocationStatus {
    return this._status;
  }

  entryFor(subscriptionId: string): SubscriptionAllocation | null {
    const entry = this._entries.find((e) => e.subscriptionId === subscriptionId);
    return entry ? { ...entry } : null;
  }

  static reconstruct(params: {
    id: AllocationId;
    tenantId: TenantId;
    closingId: string;
    productId: string;
    method: AllocationMethod;
    totalAmount: Money;
    entries: SubscriptionAllocation[];
    status: AllocationStatus;
    version: number;
  }): Allocation {
    const allocation = new Allocation(
      params.id,
      params.tenantId,
      params.closingId,
      params.productId,
      params.method,
      params.totalAmount,
      params.entries,
      params.status,
    );
    allocation._version = params.version;
    return allocation;
  }
}
import { AggregateRoot, Money, SubscriptionId, SubscriptionStatus, TenantId } from '@daos/shared-kernel';

import { AllocationApproved } from '../events/allocation-approved.event';
import { SubscriptionDocumentsSent } from '../events/subscription-documents-sent.event';
import { SubscriptionExecuted } from '../events/subscription-executed.event';
import { SubscriptionFunded } from '../events/subscription-funded.event';
import { SubscriptionReceived } from '../events/subscription-received.event';
import { SubscriptionRejected } from '../events/subscription-rejected.event';

export type ReceiveSubscriptionParams = {
  tenantId: TenantId;
  productId: string;
  investorId: string;
  requestedAmount: Money;
};

export class Subscription extends AggregateRoot {
  private constructor(
    public readonly id: SubscriptionId,
    public readonly tenantId: TenantId,
    private _productId: string,
    private _investorId: string,
    private _requestedAmount: Money,
    private _status: SubscriptionStatus,
    private _allocatedAmount: Money | null,
    private _allocationPct: number | null,
    private _paymentRef: string | null,
    private _rejectReason: string | null,
    private _fundedAt: string | null,
    private _receivedAt: string,
  ) {
    super();
  }

  static receive(params: ReceiveSubscriptionParams): Subscription {
    if (!params.productId.trim()) throw new Error('Product id is required');
    if (!params.investorId.trim()) throw new Error('Investor id is required');
    if (params.requestedAmount.amount <= 0n) throw new Error('Requested amount must be positive');
    const subscription = new Subscription(
      SubscriptionId.create(),
      params.tenantId,
      params.productId.trim(),
      params.investorId.trim(),
      params.requestedAmount,
      'draft',
      null,
      null,
      null,
      null,
      null,
      new Date().toISOString(),
    );
    subscription.raise(
      new SubscriptionReceived(
        subscription.id.value,
        subscription.tenantId.value,
        subscription._productId,
        subscription._investorId,
        subscription._requestedAmount,
      ),
    );
    subscription.incrementVersion();
    return subscription;
  }

  sendDocuments(): void {
    if (this._status !== 'draft') throw new Error('Only draft subscriptions can send documents');
    this._status = 'documentsSent';
    this.raise(new SubscriptionDocumentsSent(this.id.value, this.tenantId.value, new Date().toISOString()));
    this.incrementVersion();
  }

  executeDocuments(): void {
    if (this._status !== 'documentsSent') throw new Error('Documents must be sent before execution');
    this._status = 'documentsExecuted';
    this.raise(new SubscriptionExecuted(this.id.value, this.tenantId.value, new Date().toISOString()));
    this.incrementVersion();
  }

  approveAllocation(allocatedAmount: Money, allocationPct: number): void {
    if (this._status === 'funded') throw new Error('Funded subscriptions cannot be reallocated');
    if (this._status === 'rejected') throw new Error('Rejected subscriptions cannot be allocated');
    this._status = 'allocated';
    this._allocatedAmount = allocatedAmount;
    this._allocationPct = allocationPct;
    this.raise(
      new AllocationApproved(
        this.id.value,
        this.tenantId.value,
        this.id.value,
        this._requestedAmount,
        allocatedAmount,
        allocationPct,
      ),
    );
    this.incrementVersion();
  }

  fund(paymentRef: string): void {
    if (this._status !== 'allocated') throw new Error('Subscription must be allocated before funding');
    if (!this._allocatedAmount) throw new Error('No allocation to fund');
    this._status = 'funded';
    this._paymentRef = paymentRef;
    this._fundedAt = new Date().toISOString();
    this.raise(new SubscriptionFunded(this.id.value, this.tenantId.value, this._allocatedAmount, paymentRef));
    this.incrementVersion();
  }

  reject(reason: string): void {
    if (this._status === 'funded') throw new Error('Funded subscriptions cannot be rejected');
    if (this._status === 'rejected') throw new Error('Subscription already rejected');
    this._status = 'rejected';
    this._rejectReason = reason;
    this.raise(new SubscriptionRejected(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  get productId(): string {
    return this._productId;
  }

  get investorId(): string {
    return this._investorId;
  }

  get requestedAmount(): Money {
    return this._requestedAmount;
  }

  get status(): SubscriptionStatus {
    return this._status;
  }

  get allocatedAmount(): Money | null {
    return this._allocatedAmount;
  }

  get allocationPct(): number | null {
    return this._allocationPct;
  }

  get paymentRef(): string | null {
    return this._paymentRef;
  }

  get rejectReason(): string | null {
    return this._rejectReason;
  }

  get fundedAt(): string | null {
    return this._fundedAt;
  }

  get receivedAt(): string {
    return this._receivedAt;
  }

  getSortKey(): string {
    return `${this._receivedAt}#${this.id.value}`;
  }

  static reconstruct(params: {
    id: SubscriptionId;
    tenantId: TenantId;
    productId: string;
    investorId: string;
    requestedAmount: Money;
    status: SubscriptionStatus;
    allocatedAmount: Money | null;
    allocationPct: number | null;
    paymentRef: string | null;
    rejectReason: string | null;
    fundedAt: string | null;
    receivedAt: string;
    version: number;
  }): Subscription {
    const subscription = new Subscription(
      params.id,
      params.tenantId,
      params.productId,
      params.investorId,
      params.requestedAmount,
      params.status,
      params.allocatedAmount,
      params.allocationPct,
      params.paymentRef,
      params.rejectReason,
      params.fundedAt,
      params.receivedAt,
    );
    subscription._version = params.version;
    return subscription;
  }
}
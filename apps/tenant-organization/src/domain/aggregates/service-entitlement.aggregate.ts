import {
  AggregateRoot,
  BillingCycle,
  BillingPlanType,
  CurrentUsage,
  EntitlementStatus,
  PaymentMethod,
  ServiceEntitlementId,
  TenantId,
  UsageLimits,
} from '@daos/shared-kernel';

import { BillingPlanChanged } from '../events/billing-plan-changed.event';
import { PaymentMethodUpdated } from '../events/payment-method-updated.event';
import { SubscriptionCanceled } from '../events/subscription-canceled.event';
import { UsageRecorded } from '../events/usage-recorded.event';

export class ServiceEntitlement extends AggregateRoot {
  private constructor(
    public readonly id: ServiceEntitlementId,
    public readonly tenantId: TenantId,
    private _planType: BillingPlanType,
    private _billingCycle: BillingCycle,
    private _status: EntitlementStatus,
    private _pricePerSeat: number,
    private _paymentMethod: PaymentMethod | null,
    private _usageLimits: UsageLimits,
    private _currentUsage: CurrentUsage,
    private _nextInvoiceDate: string | null,
  ) {
    super();
  }

  static createDefault(tenantId: TenantId): ServiceEntitlement {
    const entitlement = new ServiceEntitlement(
      ServiceEntitlementId.create(),
      tenantId,
      'trial',
      'monthly',
      'trialing',
      0,
      null,
      { seats: 25, apiCallsPerMonth: 100000 },
      { apiCalls: 0, seatsUsed: 0 },
      null,
    );
    entitlement.incrementVersion();
    return entitlement;
  }

  changePlan(planType: BillingPlanType, billingCycle: BillingCycle, pricePerSeat: number, usageLimits: UsageLimits): void {
    if (this._status !== 'active' && this._status !== 'trialing' && this._status !== 'pastDue') {
      throw new Error('Canceled subscriptions cannot change plans');
    }
    if (pricePerSeat < 0) throw new Error('pricePerSeat cannot be negative');
    this._planType = planType;
    this._billingCycle = billingCycle;
    this._pricePerSeat = pricePerSeat;
    this._usageLimits = { ...usageLimits };
    this._status = 'active';
    this.raise(new BillingPlanChanged(this.id.value, this.tenantId.value, planType, billingCycle));
    this.incrementVersion();
  }

  addPaymentMethod(method: PaymentMethod): void {
    if (this._status === 'canceled') throw new Error('Canceled subscriptions cannot add payment methods');
    this._paymentMethod = { ...method };
    this.raise(new PaymentMethodUpdated(this.id.value, this.tenantId.value, method.type, method.last4));
    this.incrementVersion();
  }

  recordUsage(apiCalls: number, seatsUsed: number): void {
    if (apiCalls < 0 || seatsUsed < 0) throw new Error('Usage values cannot be negative');
    this._currentUsage = { apiCalls, seatsUsed };
    this.raise(new UsageRecorded(this.id.value, this.tenantId.value, apiCalls, seatsUsed));
    this.incrementVersion();
  }

  setNextInvoiceDate(nextInvoiceDate: string): void {
    this._nextInvoiceDate = nextInvoiceDate;
  }

  cancel(): void {
    if (this._status === 'canceled') throw new Error('Subscription already canceled');
    this._status = 'canceled';
    this.raise(new SubscriptionCanceled(this.id.value, this.tenantId.value, this._planType));
    this.incrementVersion();
  }

  get planType(): BillingPlanType {
    return this._planType;
  }

  get billingCycle(): BillingCycle {
    return this._billingCycle;
  }

  get status(): EntitlementStatus {
    return this._status;
  }

  get pricePerSeat(): number {
    return this._pricePerSeat;
  }

  get paymentMethod(): PaymentMethod | null {
    return this._paymentMethod ? { ...this._paymentMethod } : null;
  }

  get usageLimits(): UsageLimits {
    return { ...this._usageLimits };
  }

  get currentUsage(): CurrentUsage {
    return { ...this._currentUsage };
  }

  get nextInvoiceDate(): string | null {
    return this._nextInvoiceDate;
  }

  static reconstruct(params: {
    id: ServiceEntitlementId;
    tenantId: TenantId;
    planType: BillingPlanType;
    billingCycle: BillingCycle;
    status: EntitlementStatus;
    pricePerSeat: number;
    paymentMethod: PaymentMethod | null;
    usageLimits: UsageLimits;
    currentUsage: CurrentUsage;
    nextInvoiceDate: string | null;
    version: number;
  }): ServiceEntitlement {
    const entitlement = new ServiceEntitlement(
      params.id,
      params.tenantId,
      params.planType,
      params.billingCycle,
      params.status,
      params.pricePerSeat,
      params.paymentMethod,
      params.usageLimits,
      params.currentUsage,
      params.nextInvoiceDate,
    );
    entitlement._version = params.version;
    return entitlement;
  }
}

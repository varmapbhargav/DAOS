import {
  AggregateRoot,
  DistributionId,
  DistributionStatus,
  DistributionType,
  InvestorDistribution,
  Money,
  TenantId,
} from '@daos/shared-kernel';

import { DistributionApproved } from '../events/distribution-approved.event';
import { DistributionCalculated } from '../events/distribution-calculated.event';
import { DistributionDeclared } from '../events/distribution-declared.event';
import { DistributionPaid } from '../events/distribution-paid.event';
import { PromoteDistributed } from '../events/promote-distributed.event';

export type DeclareDistributionParams = {
  tenantId: TenantId;
  productId: string;
  distributionType: DistributionType;
  currency: string;
  totalAmount: bigint;
  recordDate: string;
  paymentDate: string;
};

export class Distribution extends AggregateRoot {
  private constructor(
    public readonly id: DistributionId,
    public readonly tenantId: TenantId,
    private _productId: string,
    private _distributionType: DistributionType,
    private _currency: string,
    private _totalAmount: bigint,
    private _recordDate: string,
    private _paymentDate: string,
    private _investorDistributions: InvestorDistribution[],
    private _promote: bigint,
    private _carriedInterest: bigint,
    private _status: DistributionStatus,
  ) {
    super();
  }

  static declare(params: DeclareDistributionParams): Distribution {
    if (!params.productId.trim()) throw new Error('Product id is required');
    if (params.totalAmount <= 0n) throw new Error('Distribution amount must be positive');
    const distribution = new Distribution(
      DistributionId.create(),
      params.tenantId,
      params.productId.trim(),
      params.distributionType,
      params.currency,
      params.totalAmount,
      params.recordDate,
      params.paymentDate,
      [],
      0n,
      0n,
      'declared',
    );
    distribution.raise(
      new DistributionDeclared(
        distribution.id.value,
        distribution.tenantId.value,
        distribution._productId,
        distribution._distributionType,
        { amount: distribution._totalAmount.toString(), currency: distribution._currency },
      ),
    );
    distribution.incrementVersion();
    return distribution;
  }

  calculate(params: { investorDistributions: InvestorDistribution[]; promote: bigint; carriedInterest: bigint }): void {
    if (this._status !== 'declared') throw new Error('Only declared distributions can be calculated');
    this._investorDistributions = [...params.investorDistributions];
    this._promote = params.promote;
    this._carriedInterest = params.carriedInterest;
    this._status = 'calculated';
    this.raise(
      new DistributionCalculated(this.id.value, this.tenantId.value, this._productId, {
        amount: this._totalAmount.toString(),
        currency: this._currency,
      }),
    );
    this.incrementVersion();
  }

  approve(): void {
    if (this._status !== 'calculated') throw new Error('Only calculated distributions can be approved');
    this._status = 'approved';
    this.raise(new DistributionApproved(this.id.value, this.tenantId.value, this._productId));
    this.incrementVersion();
  }

  pay(): void {
    if (this._status !== 'approved') throw new Error('Only approved distributions can be paid');
    this._status = 'paid';
    this.raise(
      new DistributionPaid(this.id.value, this.tenantId.value, this._productId, {
        amount: this._totalAmount.toString(),
        currency: this._currency,
      }),
    );
    if (this._promote > 0n) {
      this.raise(
        new PromoteDistributed(this.id.value, this.tenantId.value, this._productId, {
          amount: this._promote.toString(),
          currency: this._currency,
        }),
      );
    }
    this.incrementVersion();
  }

  get productId(): string {
    return this._productId;
  }

  get distributionType(): DistributionType {
    return this._distributionType;
  }

  get currency(): string {
    return this._currency;
  }

  get totalAmount(): bigint {
    return this._totalAmount;
  }

  get recordDate(): string {
    return this._recordDate;
  }

  get paymentDate(): string {
    return this._paymentDate;
  }

  get investorDistributions(): InvestorDistribution[] {
    return this._investorDistributions.map((d) => ({ ...d }));
  }

  get promote(): bigint {
    return this._promote;
  }

  get carriedInterest(): bigint {
    return this._carriedInterest;
  }

  get status(): DistributionStatus {
    return this._status;
  }

  static reconstruct(params: {
    id: DistributionId;
    tenantId: TenantId;
    productId: string;
    distributionType: DistributionType;
    currency: string;
    totalAmount: bigint;
    recordDate: string;
    paymentDate: string;
    investorDistributions: InvestorDistribution[];
    promote: bigint;
    carriedInterest: bigint;
    status: DistributionStatus;
    version: number;
  }): Distribution {
    const distribution = new Distribution(
      params.id,
      params.tenantId,
      params.productId,
      params.distributionType,
      params.currency,
      params.totalAmount,
      params.recordDate,
      params.paymentDate,
      params.investorDistributions,
      params.promote,
      params.carriedInterest,
      params.status,
    );
    distribution._version = params.version;
    return distribution;
  }
}

import { AggregateRoot, Money, ShareClassId, TenantId } from '@daos/shared-kernel';

import { ShareClassCreated } from '../events/share-class-created.event';

export type ShareClassStatus = 'draft' | 'active' | 'closed';

export class ShareClass extends AggregateRoot {
  private constructor(
    public readonly id: ShareClassId,
    public readonly tenantId: TenantId,
    public readonly productId: string,
    private _name: string,
    private _currency: string,
    private _targetSize: Money,
    private _minInvestment: Money,
    private _maxInvestors: number,
    private _pricePerShare: Money | null,
    private _status: ShareClassStatus,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    productId: string;
    name: string;
    currency: string;
    targetSize: Money;
    minInvestment: Money;
    maxInvestors: number;
  }): ShareClass {
    if (!params.name.trim()) throw new Error('Share class name is required');
    if (params.maxInvestors <= 0) throw new Error('Max investors must be positive');
    if (params.targetSize.currency !== params.currency) throw new Error('Currency mismatch');
    if (params.minInvestment.currency !== params.currency) throw new Error('Currency mismatch');

    const shareClass = new ShareClass(
      ShareClassId.create(),
      params.tenantId,
      params.productId,
      params.name.trim(),
      params.currency,
      params.targetSize,
      params.minInvestment,
      params.maxInvestors,
      null,
      'draft',
    );
    shareClass.raise(
      new ShareClassCreated(
        shareClass.id.value,
        shareClass.tenantId.value,
        shareClass.id.value,
        shareClass.productId,
        shareClass._name,
        shareClass._currency,
      ),
    );
    shareClass.incrementVersion();
    return shareClass;
  }

  static reconstruct(params: {
    id: ShareClassId;
    tenantId: TenantId;
    productId: string;
    name: string;
    currency: string;
    targetSize: Money;
    minInvestment: Money;
    maxInvestors: number;
    pricePerShare: Money | null;
    status: ShareClassStatus;
    version: number;
  }): ShareClass {
    const shareClass = new ShareClass(
      params.id,
      params.tenantId,
      params.productId,
      params.name,
      params.currency,
      params.targetSize,
      params.minInvestment,
      params.maxInvestors,
      params.pricePerShare,
      params.status,
    );
    shareClass._version = params.version;
    return shareClass;
  }

  get name(): string {
    return this._name;
  }

  get currency(): string {
    return this._currency;
  }

  get targetSize(): Money {
    return this._targetSize;
  }

  get minInvestment(): Money {
    return this._minInvestment;
  }

  get maxInvestors(): number {
    return this._maxInvestors;
  }

  get pricePerShare(): Money | null {
    return this._pricePerShare;
  }

  get status(): ShareClassStatus {
    return this._status;
  }

  setPrice(price: Money): void {
    if (this._status === 'closed') throw new Error('Closed share classes cannot be repriced');
    if (price.currency !== this._currency) throw new Error('Currency mismatch');
    this._pricePerShare = price;
    this.incrementVersion();
  }

  activate(): void {
    if (this._status === 'closed') throw new Error('Closed share classes cannot be activated');
    if (this._status === 'active') throw new Error('Share class is already active');
    this._pricePerShare = this._pricePerShare ?? Money.of(0n, this._currency);
    this._status = 'active';
    this.incrementVersion();
  }

  close(): void {
    if (this._status === 'closed') throw new Error('Share class is already closed');
    this._status = 'closed';
    this.incrementVersion();
  }
}

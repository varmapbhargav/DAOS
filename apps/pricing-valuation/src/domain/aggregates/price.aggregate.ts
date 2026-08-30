import { AggregateRoot, FairValueHierarchy, Money, PriceId, PricingSource, TenantId } from '@daos/shared-kernel';

import { PriceUpdated } from '../events/price-updated.event';
import { StalePriceDetected } from '../events/stale-price-detected.event';

export type PublishPriceParams = {
  tenantId: TenantId;
  isin: string;
  price: Money;
  source: PricingSource;
  fairValueHierarchy: FairValueHierarchy;
  marketDate: string;
};

export class Price extends AggregateRoot {
  private constructor(
    public readonly id: PriceId,
    public readonly tenantId: TenantId,
    private _isin: string,
    private _price: Money,
    private _source: PricingSource,
    private _fairValueHierarchy: FairValueHierarchy,
    private _lastUpdatedAt: string,
    private _isStale: boolean,
  ) {
    super();
  }

  static publish(params: PublishPriceParams): Price {
    if (!params.isin.trim()) throw new Error('ISIN is required');
    const price = new Price(
      PriceId.create(),
      params.tenantId,
      params.isin.trim(),
      params.price,
      params.source,
      params.fairValueHierarchy,
      params.marketDate,
      false,
    );
    price.raise(
      new PriceUpdated(price.id.value, price.tenantId.value, price._isin, {
        amount: price._price.amount.toString(),
        currency: price._price.currency,
      }, price._source),
    );
    price.incrementVersion();
    return price;
  }

  updatePrice(params: { price: Money; source: PricingSource; fairValueHierarchy: FairValueHierarchy; marketDate: string }): void {
    this._price = params.price;
    this._source = params.source;
    this._fairValueHierarchy = params.fairValueHierarchy;
    this._lastUpdatedAt = params.marketDate;
    this._isStale = false;
    this.raise(
      new PriceUpdated(this.id.value, this.tenantId.value, this._isin, {
        amount: this._price.amount.toString(),
        currency: this._price.currency,
      }, this._source),
    );
    this.incrementVersion();
  }

  markStale(): void {
    if (this._isStale) throw new Error('Price is already marked stale');
    this._isStale = true;
    this.raise(
      new StalePriceDetected(this.id.value, this.tenantId.value, this._isin, {
        amount: this._price.amount.toString(),
        currency: this._price.currency,
      }),
    );
    this.incrementVersion();
  }

  get isin(): string {
    return this._isin;
  }

  get price(): Money {
    return this._price;
  }

  get source(): PricingSource {
    return this._source;
  }

  get fairValueHierarchy(): FairValueHierarchy {
    return this._fairValueHierarchy;
  }

  get lastUpdatedAt(): string {
    return this._lastUpdatedAt;
  }

  get isStale(): boolean {
    return this._isStale;
  }

  static reconstruct(params: {
    id: PriceId;
    tenantId: TenantId;
    isin: string;
    price: Money;
    source: PricingSource;
    fairValueHierarchy: FairValueHierarchy;
    lastUpdatedAt: string;
    isStale: boolean;
    version: number;
  }): Price {
    const price = new Price(
      params.id,
      params.tenantId,
      params.isin,
      params.price,
      params.source,
      params.fairValueHierarchy,
      params.lastUpdatedAt,
      params.isStale,
    );
    price._version = params.version;
    return price;
  }
}

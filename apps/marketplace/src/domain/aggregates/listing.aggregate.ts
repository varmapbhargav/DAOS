import { AggregateRoot, ListingId, ListingStatus, ListingType, MarketSession, Money, TenantId, TradingMechanism } from '@daos/shared-kernel';

import { ListingDelisted } from '../events/listing-delisted.event';
import { ListingPublished } from '../events/listing-published.event';
import { ListingSuspended } from '../events/listing-suspended.event';

export type PublishListingParams = {
  tenantId: TenantId;
  productId: string;
  issueId?: string | null;
  listingType: ListingType;
  mechanism: TradingMechanism;
  currency: string;
  totalQuantity: bigint;
  minimumQuantity: bigint;
  referencePrice: Money | null;
  session: MarketSession;
};

export class Listing extends AggregateRoot {
  private constructor(
    public readonly id: ListingId,
    public readonly tenantId: TenantId,
    private _productId: string,
    private _issueId: string | null,
    private _listingType: ListingType,
    private _mechanism: TradingMechanism,
    private _currency: string,
    private _totalQuantity: bigint,
    private _minimumQuantity: bigint,
    private _referencePrice: Money | null,
    private _session: MarketSession,
    private _status: ListingStatus,
  ) {
    super();
  }

  static publish(params: PublishListingParams): Listing {
    if (!params.productId.trim()) throw new Error('Product id is required');
    if (params.totalQuantity <= 0n) throw new Error('Total quantity must be positive');
    if (params.minimumQuantity <= 0n) throw new Error('Minimum quantity must be positive');
    if (params.minimumQuantity > params.totalQuantity) throw new Error('Minimum quantity cannot exceed total quantity');
    const listing = new Listing(
      ListingId.create(),
      params.tenantId,
      params.productId.trim(),
      params.issueId ?? null,
      params.listingType,
      params.mechanism,
      params.currency,
      params.totalQuantity,
      params.minimumQuantity,
      params.referencePrice,
      params.session,
      'active',
    );
    listing.raise(
      new ListingPublished(
        listing.id.value,
        listing.tenantId.value,
        listing._productId,
        listing._issueId,
        listing._listingType,
        listing._mechanism,
        { amount: (listing._referencePrice?.amount ?? 0n).toString(), currency: listing._currency },
        listing._totalQuantity.toString(),
      ),
    );
    listing.incrementVersion();
    return listing;
  }

  suspend(reason: string): void {
    if (this._status === 'delisted') throw new Error('Delisted listings cannot be suspended');
    if (this._status !== 'active') throw new Error('Only active listings can be suspended');
    this._status = 'suspended';
    this.raise(new ListingSuspended(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  delist(reason: string): void {
    if (this._status === 'delisted') throw new Error('Listing already delisted');
    this._status = 'delisted';
    this.raise(new ListingDelisted(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  get productId(): string {
    return this._productId;
  }

  get issueId(): string | null {
    return this._issueId;
  }

  get listingType(): ListingType {
    return this._listingType;
  }

  get mechanism(): TradingMechanism {
    return this._mechanism;
  }

  get currency(): string {
    return this._currency;
  }

  get totalQuantity(): bigint {
    return this._totalQuantity;
  }

  get minimumQuantity(): bigint {
    return this._minimumQuantity;
  }

  get referencePrice(): Money | null {
    return this._referencePrice;
  }

  get session(): MarketSession {
    return this._session;
  }

  get status(): ListingStatus {
    return this._status;
  }

  static reconstruct(params: {
    id: ListingId;
    tenantId: TenantId;
    productId: string;
    issueId: string | null;
    listingType: ListingType;
    mechanism: TradingMechanism;
    currency: string;
    totalQuantity: bigint;
    minimumQuantity: bigint;
    referencePrice: Money | null;
    session: MarketSession;
    status: ListingStatus;
    version: number;
  }): Listing {
    const listing = new Listing(
      params.id,
      params.tenantId,
      params.productId,
      params.issueId,
      params.listingType,
      params.mechanism,
      params.currency,
      params.totalQuantity,
      params.minimumQuantity,
      params.referencePrice,
      params.session,
      params.status,
    );
    listing._version = params.version;
    return listing;
  }
}

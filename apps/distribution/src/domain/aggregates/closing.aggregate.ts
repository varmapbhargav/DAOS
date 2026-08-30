import { AggregateRoot, ClosingId, ClosingStatus, TenantId } from '@daos/shared-kernel';

import { ClosingCompleted } from '../events/closing-completed.event';

export type ScheduleClosingParams = {
  tenantId: TenantId;
  productId: string;
  closesAt: string;
};

export class Closing extends AggregateRoot {
  private constructor(
    public readonly id: ClosingId,
    public readonly tenantId: TenantId,
    private _productId: string,
    private _status: ClosingStatus,
    private _closesAt: string,
    private _completedAt: string | null,
  ) {
    super();
  }

  static schedule(params: ScheduleClosingParams): Closing {
    if (!params.productId.trim()) throw new Error('Product id is required');
    const closing = new Closing(
      ClosingId.create(),
      params.tenantId,
      params.productId.trim(),
      'scheduled',
      params.closesAt,
      null,
    );
    closing.incrementVersion();
    return closing;
  }

  open(): void {
    if (this._status !== 'scheduled') throw new Error('Only scheduled closings can be opened');
    this._status = 'open';
    this.incrementVersion();
  }

  softClose(): void {
    if (this._status !== 'open') throw new Error('Only open closings can soft close');
    this._status = 'soft';
    this.incrementVersion();
  }

  hardClose(): void {
    if (this._status !== 'open' && this._status !== 'soft') throw new Error('Closing must be open or soft to complete');
    this._status = 'hard';
    this._completedAt = new Date().toISOString();
    this.raise(new ClosingCompleted(this.id.value, this.tenantId.value, this._completedAt));
    this.incrementVersion();
  }

  get productId(): string {
    return this._productId;
  }

  get status(): ClosingStatus {
    return this._status;
  }

  get closesAt(): string {
    return this._closesAt;
  }

  get completedAt(): string | null {
    return this._completedAt;
  }

  static reconstruct(params: {
    id: ClosingId;
    tenantId: TenantId;
    productId: string;
    status: ClosingStatus;
    closesAt: string;
    completedAt: string | null;
    version: number;
  }): Closing {
    const closing = new Closing(
      params.id,
      params.tenantId,
      params.productId,
      params.status,
      params.closesAt,
      params.completedAt,
    );
    closing._version = params.version;
    return closing;
  }
}
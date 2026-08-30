import { AggregateRoot, TenantId, WaterfallModelId, WaterfallTier, WaterfallType } from '@daos/shared-kernel';

import { WaterfallModelApproved } from '../events/waterfall-model-approved.event';

export type WaterfallModelStatus = 'draft' | 'approved';

export type CreateWaterfallModelParams = {
  tenantId: TenantId;
  name: string;
  waterfallType: WaterfallType;
  productId: string;
  tiers: WaterfallTier[];
};

export class WaterfallModel extends AggregateRoot {
  private constructor(
    public readonly id: WaterfallModelId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _waterfallType: WaterfallType,
    private _productId: string,
    private _tiers: WaterfallTier[],
    private _status: WaterfallModelStatus,
  ) {
    super();
  }

  static create(params: CreateWaterfallModelParams): WaterfallModel {
    if (!params.name.trim()) throw new Error('Waterfall model name is required');
    if (params.productId.trim() === '') throw new Error('Product id is required');
    if (params.tiers.length === 0) throw new Error('At least one waterfall tier is required');
    const model = new WaterfallModel(
      WaterfallModelId.create(),
      params.tenantId,
      params.name.trim(),
      params.waterfallType,
      params.productId.trim(),
      [...params.tiers].sort((a, b) => a.tierOrder - b.tierOrder),
      'draft',
    );
    model.incrementVersion();
    return model;
  }

  approve(): void {
    if (this._status === 'approved') throw new Error('Waterfall model already approved');
    this._status = 'approved';
    this.raise(new WaterfallModelApproved(this.id.value, this.tenantId.value, this._name));
    this.incrementVersion();
  }

  get name(): string {
    return this._name;
  }

  get waterfallType(): WaterfallType {
    return this._waterfallType;
  }

  get productId(): string {
    return this._productId;
  }

  get tiers(): WaterfallTier[] {
    return [...this._tiers];
  }

  get status(): WaterfallModelStatus {
    return this._status;
  }

  static reconstruct(params: {
    id: WaterfallModelId;
    tenantId: TenantId;
    name: string;
    waterfallType: WaterfallType;
    productId: string;
    tiers: WaterfallTier[];
    status: WaterfallModelStatus;
    version: number;
  }): WaterfallModel {
    const model = new WaterfallModel(
      params.id,
      params.tenantId,
      params.name,
      params.waterfallType,
      params.productId,
      params.tiers,
      params.status,
    );
    model._version = params.version;
    return model;
  }
}

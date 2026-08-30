import {
  AggregateRoot,
  Money,
  TenantId,
  WaterfallId,
  WaterfallTierId,
  WaterfallTierData,
  WaterfallDistributionType,
} from '@daos/shared-kernel';

export type WaterfallTierEntry = WaterfallTierData & { tierId: string };

export type TierAllocation = {
  tierId: string;
  priority: number;
  recipient: string;
  distributionType: WaterfallDistributionType;
  allocated: Money;
  remaining: Money;
  catchUpApplied: boolean;
};

export type WaterfallCalculationTrace = {
  calculatedAt: string;
  availableForDistribution: Money;
  totalAllocated: Money;
  residualRemaining: Money;
  allocations: TierAllocation[];
};

export class DistributionWaterfall extends AggregateRoot {
  private constructor(
    public readonly id: WaterfallId,
    public readonly dealId: string,
    public readonly tenantId: TenantId,
    private _tiers: WaterfallTierEntry[],
    private _lastTrace: WaterfallCalculationTrace | null,
    private _immutable: boolean,
  ) {
    super();
  }

  static create(params: {
    dealId: string;
    tenantId: TenantId;
    tiers?: WaterfallTierData[];
  }): DistributionWaterfall {
    const wf = new DistributionWaterfall(
      WaterfallId.create(),
      params.dealId,
      params.tenantId,
      [],
      null,
      false,
    );
    for (const tier of params.tiers ?? []) {
      wf._addTier(tier);
    }
    return wf;
  }

  static reconstruct(params: {
    id: WaterfallId;
    dealId: string;
    tenantId: TenantId;
    tiers: WaterfallTierEntry[];
    lastTrace: WaterfallCalculationTrace | null;
    immutable: boolean;
    version: number;
  }): DistributionWaterfall {
    const wf = new DistributionWaterfall(
      params.id,
      params.dealId,
      params.tenantId,
      params.tiers,
      params.lastTrace,
      params.immutable,
    );
    wf._version = params.version;
    return wf;
  }

  get tiers(): WaterfallTierEntry[] { return [...this._tiers]; }
  get lastTrace(): WaterfallCalculationTrace | null { return this._lastTrace; }
  get immutable(): boolean { return this._immutable; }

  private _addTier(tier: WaterfallTierData): void {
    const duplicate = this._tiers.find((t) => t.priority === tier.priority);
    if (duplicate) throw new Error(`Duplicate waterfall tier priority: ${tier.priority}`);
    this._tiers.push({ ...tier, tierId: WaterfallTierId.create().value });
    this._tiers.sort((a, b) => a.priority - b.priority);
  }

  addTier(tier: WaterfallTierData): void {
    if (this._immutable) throw new Error('Waterfall is locked after deal closure');
    this._addTier(tier);
    this.incrementVersion();
  }

  removeTier(tierId: string): void {
    if (this._immutable) throw new Error('Waterfall is locked after deal closure');
    const idx = this._tiers.findIndex((t) => t.tierId === tierId);
    if (idx === -1) throw new Error(`Waterfall tier not found: ${tierId}`);
    this._tiers.splice(idx, 1);
    this.incrementVersion();
  }

  updateTier(tierId: string, updates: Partial<WaterfallTierData>): void {
    if (this._immutable) throw new Error('Waterfall is locked after deal closure');
    const tier = this._tiers.find((t) => t.tierId === tierId);
    if (!tier) throw new Error(`Waterfall tier not found: ${tierId}`);
    if (updates.priority !== undefined && updates.priority !== tier.priority) {
      const dup = this._tiers.find((t) => t.tierId !== tierId && t.priority === updates.priority);
      if (dup) throw new Error(`Duplicate waterfall tier priority: ${updates.priority}`);
    }
    Object.assign(tier, updates);
    this._tiers.sort((a, b) => a.priority - b.priority);
    this.incrementVersion();
  }

  lock(): void {
    this._immutable = true;
    this.incrementVersion();
  }

  applyTrace(trace: WaterfallCalculationTrace): void {
    this._lastTrace = trace;
    this.incrementVersion();
  }
}

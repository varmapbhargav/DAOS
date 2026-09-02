import { AssetPoolId, ConcentrationRule, EligibilityPolicy, PoolStatus, PoolStrategy, PoolType, TenantId } from '@daos/shared-kernel';

import { PoolAsset } from './pool-asset.entity';

export class AssetPool {
  private constructor(
    public readonly id: AssetPoolId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _description: string | null,
    private _poolType: PoolType,
    private _strategy: PoolStrategy,
    private _currency: string,
    private _status: PoolStatus,
    private _assets: Map<string, PoolAsset>,
    private _concentrationRules: ConcentrationRule[],
    private _eligibilityPolicy: EligibilityPolicy,
    private _grossValue: number,
    private _netValue: number,
    private _outstandingValue: number,
    private _jurisdictions: string[],
    private _weightedAvgMaturity: number | null,
    private _weightedAvgLTV: number | null,
    private _concentration: number,
    private _version: number,
    private _createdBy: string,
    private _createdAt: string,
    private _updatedAt: string,
    private _closedAt: string | null,
    private _parentPoolId: string | null,
    private _childPoolIds: string[],
  ) {}

  static create(params: {
    tenantId: TenantId;
    name: string;
    description?: string | null;
    poolType: PoolType;
    strategy: PoolStrategy;
    currency: string;
    eligibilityPolicy?: EligibilityPolicy;
    concentrationRules?: ConcentrationRule[];
    createdBy: string;
  }): AssetPool {
    return new AssetPool(
      AssetPoolId.create(),
      params.tenantId,
      params.name,
      params.description ?? null,
      params.poolType,
      params.strategy,
      params.currency,
      'DRAFT',
      new Map(),
      params.concentrationRules ?? [],
      params.eligibilityPolicy ?? {},
      0,
      0,
      0,
      [],
      null,
      null,
      0,
      1,
      params.createdBy,
      new Date().toISOString(),
      new Date().toISOString(),
      null,
      null,
      [],
    );
  }

  static reconstruct(params: {
    id: AssetPoolId;
    tenantId: TenantId;
    name: string;
    description: string | null;
    poolType: PoolType;
    strategy: PoolStrategy;
    currency: string;
    status: PoolStatus;
    assets: Map<string, PoolAsset>;
    concentrationRules: ConcentrationRule[];
    eligibilityPolicy: EligibilityPolicy;
    grossValue: number;
    netValue: number;
    outstandingValue: number;
    jurisdictions: string[];
    weightedAvgMaturity: number | null;
    weightedAvgLTV: number | null;
    concentration: number;
    version: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
    parentPoolId: string | null;
    childPoolIds: string[];
  }): AssetPool {
    return new AssetPool(
      params.id,
      params.tenantId,
      params.name,
      params.description,
      params.poolType,
      params.strategy,
      params.currency,
      params.status,
      params.assets,
      params.concentrationRules,
      params.eligibilityPolicy,
      params.grossValue,
      params.netValue,
      params.outstandingValue,
      params.jurisdictions,
      params.weightedAvgMaturity,
      params.weightedAvgLTV,
      params.concentration,
      params.version,
      params.createdBy,
      params.createdAt,
      params.updatedAt,
      params.closedAt,
      params.parentPoolId,
      params.childPoolIds,
    );
  }

  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get poolType(): PoolType {
    return this._poolType;
  }
  get strategy(): PoolStrategy {
    return this._strategy;
  }
  get currency(): string {
    return this._currency;
  }
  get status(): PoolStatus {
    return this._status;
  }
  get assets(): Map<string, PoolAsset> {
    return new Map(this._assets);
  }
  get activeAssets(): PoolAsset[] {
    return Array.from(this._assets.values()).filter((a) => a.isActive);
  }
  get concentrationRules(): ConcentrationRule[] {
    return [...this._concentrationRules];
  }
  get eligibilityPolicy(): EligibilityPolicy {
    return { ...this._eligibilityPolicy };
  }
  get grossValue(): number {
    return this._grossValue;
  }
  get netValue(): number {
    return this._netValue;
  }
  get outstandingValue(): number {
    return this._outstandingValue;
  }
  get jurisdictions(): string[] {
    return [...this._jurisdictions];
  }
  get weightedAvgMaturity(): number | null {
    return this._weightedAvgMaturity;
  }
  get weightedAvgLTV(): number | null {
    return this._weightedAvgLTV;
  }
  get concentration(): number {
    return this._concentration;
  }
  get version(): number {
    return this._version;
  }
  get createdBy(): string {
    return this._createdBy;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get updatedAt(): string {
    return this._updatedAt;
  }
  get closedAt(): string | null {
    return this._closedAt;
  }
  get parentPoolId(): string | null {
    return this._parentPoolId;
  }
  get childPoolIds(): string[] {
    return [...this._childPoolIds];
  }

  updateBasicInfo(name: string, description: string | null): void {
    if (this._status !== 'DRAFT' && this._status !== 'ACTIVE') throw new Error('Cannot update pool in current status');
    this._name = name;
    this._description = description;
    this._updatedAt = new Date().toISOString();
  }

  activate(): void {
    if (this._status !== 'DRAFT') throw new Error('Can only activate DRAFT pool');
    this._status = 'ACTIVE';
    this._updatedAt = new Date().toISOString();
  }

  suspend(): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only suspend ACTIVE pool');
    this._status = 'SUSPENDED';
    this._updatedAt = new Date().toISOString();
  }

  close(): void {
    if (this._status === 'LIQUIDATED' || this._status === 'LIQUIDATING') throw new Error('Cannot close already liquidated pool');
    this._status = 'CLOSED';
    this._closedAt = new Date().toISOString();
    this._updatedAt = new Date().toISOString();
  }

  startLiquidation(): void {
    if (this._status !== 'ACTIVE' && this._status !== 'CLOSED') throw new Error('Can only liquidate ACTIVE or CLOSED pool');
    this._status = 'LIQUIDATING';
    this._updatedAt = new Date().toISOString();
  }

  completeLiquidation(): void {
    if (this._status !== 'LIQUIDATING') throw new Error('Pool is not liquidating');
    this._status = 'LIQUIDATED';
    this._closedAt = new Date().toISOString();
    this._updatedAt = new Date().toISOString();
  }

  addAsset(poolAsset: PoolAsset): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only add assets to ACTIVE pool');
    const existing = this._assets.get(poolAsset.assetId);
    if (existing && existing.isActive) throw new Error('Asset already in pool');
    this._assets.set(poolAsset.assetId, poolAsset);
    this.recalculateMetrics();
    this._updatedAt = new Date().toISOString();
  }

  removeAsset(assetId: string, reason: string | null): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only remove assets from ACTIVE pool');
    const poolAsset = this._assets.get(assetId);
    if (!poolAsset || !poolAsset.isActive) throw new Error('Asset not in pool');
    poolAsset.remove(reason);
    this.recalculateMetrics();
    this._updatedAt = new Date().toISOString();
  }

  updateAssetAllocation(assetId: string, newPercentage: number): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only update allocations in ACTIVE pool');
    const poolAsset = this._assets.get(assetId);
    if (!poolAsset || !poolAsset.isActive) throw new Error('Asset not in pool');
    poolAsset.updateAllocation(newPercentage);
    this.recalculateMetrics();
    this._updatedAt = new Date().toISOString();
  }

  private recalculateMetrics(): void {
    const active = this.activeAssets;
    this._grossValue = active.reduce((sum, a) => sum + a.allocationPercentage, 0);
    this._concentration = active.length > 0
      ? Math.max(...active.map((a) => a.allocationPercentage))
      : 0;
    // netValue, outstandingValue, weightedAvgMaturity, weightedAvgLTV, jurisdictions
    // would be computed from actual asset data - placeholder for now
  }

  rebalance(targetAllocations: Map<string, number>): { poolAssetId: string; oldAllocation: number; newAllocation: number }[] {
    if (this._status !== 'ACTIVE') throw new Error('Can only rebalance ACTIVE pool');
    const changes: { poolAssetId: string; oldAllocation: number; newAllocation: number }[] = [];
    for (const [assetId, targetPct] of targetAllocations) {
      const poolAsset = this._assets.get(assetId);
      if (!poolAsset || !poolAsset.isActive) continue;
      const oldPct = poolAsset.allocationPercentage;
      if (oldPct !== targetPct) {
        poolAsset.updateAllocation(targetPct);
        changes.push({ poolAssetId: poolAsset.id.value, oldAllocation: oldPct, newAllocation: targetPct });
      }
    }
    this.recalculateMetrics();
    this._updatedAt = new Date().toISOString();
    return changes;
  }

  split(criteria: Record<string, unknown>, newPoolIds: string[]): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only split ACTIVE pool');
    for (const newId of newPoolIds) {
      this._childPoolIds.push(newId);
    }
    this._updatedAt = new Date().toISOString();
  }

  merge(_sourcePoolIds: string[]): void {
    if (this._status !== 'ACTIVE') throw new Error('Target pool must be ACTIVE');
    // Merge logic would move assets from source pools to this pool
    this._updatedAt = new Date().toISOString();
  }

  setParentPool(parentPoolId: string): void {
    this._parentPoolId = parentPoolId;
    this._updatedAt = new Date().toISOString();
  }

  addConcentrationRule(rule: ConcentrationRule): void {
    if (this._status !== 'DRAFT' && this._status !== 'ACTIVE') throw new Error('Cannot add rules in current status');
    this._concentrationRules.push(rule);
    this._updatedAt = new Date().toISOString();
  }

  removeConcentrationRule(ruleType: ConcentrationRule['type'], scope?: string): void {
    this._concentrationRules = this._concentrationRules.filter(
      (r) => r.type !== ruleType || r.scope !== scope,
    );
    this._updatedAt = new Date().toISOString();
  }

  updateEligibilityPolicy(policy: EligibilityPolicy): void {
    if (this._status !== 'DRAFT' && this._status !== 'ACTIVE') throw new Error('Cannot update policy in current status');
    this._eligibilityPolicy = { ...policy };
    this._updatedAt = new Date().toISOString();
  }

  checkEligibility(assetData: {
    value: number;
    assetClass: string;
    jurisdiction: string;
    creditRating?: string;
    ltv?: number;
    seasoningMonths?: number;
  }): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const policy = this._eligibilityPolicy;
    if (policy.minAssetValue && assetData.value < policy.minAssetValue) {
      reasons.push(`Asset value below minimum (${policy.minAssetValue})`);
    }
    if (policy.maxAssetValue && assetData.value > policy.maxAssetValue) {
      reasons.push(`Asset value above maximum (${policy.maxAssetValue})`);
    }
    if (policy.allowedAssetClasses && !policy.allowedAssetClasses.includes(assetData.assetClass)) {
      reasons.push(`Asset class not allowed`);
    }
    if (policy.allowedJurisdictions && !policy.allowedJurisdictions.includes(assetData.jurisdiction)) {
      reasons.push(`Jurisdiction not allowed`);
    }
    if (policy.requiredCreditRating && assetData.creditRating && assetData.creditRating < policy.requiredCreditRating) {
      reasons.push(`Credit rating below required`);
    }
    if (policy.maxLTV && assetData.ltv && assetData.ltv > policy.maxLTV) {
      reasons.push(`LTV above maximum (${policy.maxLTV})`);
    }
    if (policy.minSeasoningMonths && assetData.seasoningMonths && assetData.seasoningMonths < policy.minSeasoningMonths) {
      reasons.push(`Seasoning below minimum (${policy.minSeasoningMonths} months)`);
    }
    return { eligible: reasons.length === 0, reasons };
  }

  incrementVersion(): void {
    this._version++;
    this._updatedAt = new Date().toISOString();
  }
}
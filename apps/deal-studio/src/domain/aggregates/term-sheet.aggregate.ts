import {
  AggregateRoot,
  ClosingConditionId,
  EconomicRights,
  GovernanceTerms,
  TenantId,
  TermSheetId,
  TermSheetVersionId,
  TransferRestriction,
  VestingSchedule,
} from '@daos/shared-kernel';

import { TermSheetDrafted } from '../events/term-sheet-drafted.event';
import { TermSheetFinalized } from '../events/term-sheet-finalized.event';
import { TermSheetUpdated } from '../events/term-sheet-updated.event';

export type TermSheetStatus = 'DRAFT' | 'UNDER_REVIEW' | 'FINAL' | 'SUPERSEDED';
export type TermSheetVersionStatus = 'DRAFT' | 'FINAL' | 'SUPERSEDED' | 'AMENDED';

export type TermSheetVersionSnapshot = {
  versionId: string;
  versionNumber: number;
  status: TermSheetVersionStatus;
  economicRights: EconomicRights | null;
  governanceTerms: GovernanceTerms | null;
  vestingSchedule: VestingSchedule | null;
  transferRestrictions: TransferRestriction[];
  closingConditionIds: string[];
  amendmentReason: string | null;
  createdBy: string;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
};

export class TermSheet extends AggregateRoot {
  private constructor(
    public readonly id: TermSheetId,
    public readonly tenantId: TenantId,
    public readonly dealId: string,
    private _status: TermSheetStatus,
    private _currentVersionNumber: number,
    private _versions: TermSheetVersionSnapshot[],
    // live (mutable until finalized) fields
    private _economicRights: EconomicRights | null,
    private _governanceTerms: GovernanceTerms | null,
    private _vestingSchedule: VestingSchedule | null,
    private _transferRestrictions: TransferRestriction[],
    private _closingConditionIds: string[],
    private _finalizedAt: string | null,
    private _finalizedBy: string | null,
  ) {
    super();
  }

  // ─── Factory ─────────────────────────────────────────────────────────────────

  static create(params: {
    tenantId: TenantId;
    dealId: string;
    createdBy: string;
    economicRights?: EconomicRights | null;
    governanceTerms?: GovernanceTerms | null;
    vestingSchedule?: VestingSchedule | null;
    transferRestrictions?: TransferRestriction[];
  }): TermSheet {
    const ts = new TermSheet(
      TermSheetId.create(),
      params.tenantId,
      params.dealId,
      'DRAFT',
      1,
      [],
      params.economicRights ?? null,
      params.governanceTerms ?? null,
      params.vestingSchedule ?? null,
      params.transferRestrictions ?? [],
      [],
      null,
      null,
    );
    ts._snapshotVersion('DRAFT', null, params.createdBy);
    ts.raise(
      new TermSheetDrafted(ts.dealId, ts.tenantId.value, params.createdBy, ts.id.value, 1),
    );
    ts.incrementVersion();
    return ts;
  }

  static reconstruct(params: {
    id: TermSheetId;
    tenantId: TenantId;
    dealId: string;
    status: TermSheetStatus;
    currentVersionNumber: number;
    versions: TermSheetVersionSnapshot[];
    economicRights: EconomicRights | null;
    governanceTerms: GovernanceTerms | null;
    vestingSchedule: VestingSchedule | null;
    transferRestrictions: TransferRestriction[];
    closingConditionIds: string[];
    finalizedAt: string | null;
    finalizedBy: string | null;
    version: number;
  }): TermSheet {
    const ts = new TermSheet(
      params.id,
      params.tenantId,
      params.dealId,
      params.status,
      params.currentVersionNumber,
      params.versions,
      params.economicRights,
      params.governanceTerms,
      params.vestingSchedule,
      params.transferRestrictions,
      params.closingConditionIds,
      params.finalizedAt,
      params.finalizedBy,
    );
    ts._version = params.version;
    return ts;
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get status(): TermSheetStatus { return this._status; }
  get currentVersionNumber(): number { return this._currentVersionNumber; }
  get versions(): TermSheetVersionSnapshot[] { return [...this._versions]; }
  get economicRights(): EconomicRights | null { return this._economicRights; }
  get governanceTerms(): GovernanceTerms | null { return this._governanceTerms; }
  get vestingSchedule(): VestingSchedule | null { return this._vestingSchedule; }
  get transferRestrictions(): TransferRestriction[] { return [...this._transferRestrictions]; }
  get closingConditionIds(): string[] { return [...this._closingConditionIds]; }
  get finalizedAt(): string | null { return this._finalizedAt; }
  get finalizedBy(): string | null { return this._finalizedBy; }

  get currentVersion(): TermSheetVersionSnapshot | null {
    return this._versions.find((v) => v.versionNumber === this._currentVersionNumber) ?? null;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private _guardMutable(): void {
    if (this._status === 'FINAL') throw new Error('Term sheet is finalized and cannot be modified');
    if (this._status === 'SUPERSEDED') throw new Error('Term sheet is superseded');
  }

  private _snapshotVersion(
    status: TermSheetVersionStatus,
    amendmentReason: string | null,
    createdBy: string,
  ): void {
    // Mark previous version as superseded
    for (const v of this._versions) {
      if (v.status === 'DRAFT' || v.status === 'FINAL') {
        v.status = 'SUPERSEDED';
      }
    }
    this._versions.push({
      versionId: TermSheetVersionId.create().value,
      versionNumber: this._currentVersionNumber,
      status,
      economicRights: this._economicRights,
      governanceTerms: this._governanceTerms,
      vestingSchedule: this._vestingSchedule,
      transferRestrictions: [...this._transferRestrictions],
      closingConditionIds: [...this._closingConditionIds],
      amendmentReason,
      createdBy,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
    });
  }

  // ─── Commands ─────────────────────────────────────────────────────────────────

  updateTerms(params: {
    economicRights?: EconomicRights | null;
    governanceTerms?: GovernanceTerms | null;
    vestingSchedule?: VestingSchedule | null;
    transferRestrictions?: TransferRestriction[];
    amendmentReason: string;
    updatedBy: string;
  }): void {
    this._guardMutable();

    if (params.economicRights !== undefined) this._economicRights = params.economicRights;
    if (params.governanceTerms !== undefined) this._governanceTerms = params.governanceTerms;
    if (params.vestingSchedule !== undefined) this._vestingSchedule = params.vestingSchedule;
    if (params.transferRestrictions !== undefined) this._transferRestrictions = params.transferRestrictions;

    this._currentVersionNumber += 1;
    this._snapshotVersion('AMENDED', params.amendmentReason, params.updatedBy);

    this.raise(
      new TermSheetUpdated(
        this.dealId,
        this.tenantId.value,
        params.updatedBy,
        this.id.value,
        this._currentVersionNumber,
      ),
    );
    this.incrementVersion();
  }

  linkClosingCondition(conditionId: string): void {
    this._guardMutable();
    if (!this._closingConditionIds.includes(conditionId)) {
      this._closingConditionIds.push(conditionId);
      this.incrementVersion();
    }
  }

  unlinkClosingCondition(conditionId: string): void {
    this._guardMutable();
    this._closingConditionIds = this._closingConditionIds.filter((id) => id !== conditionId);
    this.incrementVersion();
  }

  finalize(by: string): void {
    this._guardMutable();
    if (!this._economicRights) {
      throw new Error('Cannot finalize term sheet without economic rights');
    }
    if (this._closingConditionIds.length === 0) {
      throw new Error('Cannot finalize term sheet without at least one closing condition');
    }

    this._status = 'FINAL';
    this._finalizedAt = new Date().toISOString();
    this._finalizedBy = by;

    // Snapshot the final version
    const latest = this._versions.find((v) => v.versionNumber === this._currentVersionNumber);
    if (latest) {
      latest.status = 'FINAL';
      latest.approvedBy = by;
      latest.approvedAt = this._finalizedAt;
    }

    this.raise(
      new TermSheetFinalized(
        this.dealId,
        this.tenantId.value,
        by,
        this.id.value,
        this._currentVersionNumber,
      ),
    );
    this.incrementVersion();
  }

  // ─── Legacy compat methods (kept so existing command handlers compile) ────────

  addClosingCondition(condition: { conditionType: string; description: string; metAt: string | null }): void {
    // no-op: conditions are now managed via ClosingCondition aggregate
    // kept for backward-compat with existing handlers
  }

  markConditionMet(description: string): void {
    // no-op: conditions are now managed via ClosingCondition aggregate
  }
}

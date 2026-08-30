import {
  ClosingCondition,
  EconomicRights,
  GovernanceTerms,
  TenantId,
  TermSheetId,
  TransferRestriction,
  VestingSchedule,
} from '@daos/shared-kernel';

export class TermSheet {
  private constructor(
    public readonly id: TermSheetId,
    public readonly tenantId: TenantId,
    public readonly dealId: string,
    private _governanceTerms: GovernanceTerms | null,
    private _economicRights: EconomicRights | null,
    private _vestingSchedule: VestingSchedule | null,
    private _transferRestrictions: TransferRestriction[],
    private _closingConditions: ClosingCondition[],
    private _status: 'draft' | 'finalized',
    private _finalizedAt: string | null,
    private _finalizedBy: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    dealId: string;
    governanceTerms?: GovernanceTerms | null;
    economicRights?: EconomicRights | null;
    vestingSchedule?: VestingSchedule | null;
    transferRestrictions?: TransferRestriction[];
    closingConditions?: ClosingCondition[];
  }): TermSheet {
    return new TermSheet(
      TermSheetId.create(),
      params.tenantId,
      params.dealId,
      params.governanceTerms ?? null,
      params.economicRights ?? null,
      params.vestingSchedule ?? null,
      params.transferRestrictions ?? [],
      params.closingConditions ?? [],
      'draft',
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: TermSheetId;
    tenantId: TenantId;
    dealId: string;
    governanceTerms: GovernanceTerms | null;
    economicRights: EconomicRights | null;
    vestingSchedule: VestingSchedule | null;
    transferRestrictions: TransferRestriction[];
    closingConditions: ClosingCondition[];
    status: 'draft' | 'finalized';
    finalizedAt: string | null;
    finalizedBy: string | null;
  }): TermSheet {
    return new TermSheet(
      params.id,
      params.tenantId,
      params.dealId,
      params.governanceTerms,
      params.economicRights,
      params.vestingSchedule,
      params.transferRestrictions,
      params.closingConditions,
      params.status,
      params.finalizedAt,
      params.finalizedBy,
    );
  }

  get governanceTerms(): GovernanceTerms | null {
    return this._governanceTerms;
  }

  get economicRights(): EconomicRights | null {
    return this._economicRights;
  }

  get vestingSchedule(): VestingSchedule | null {
    return this._vestingSchedule;
  }

  get transferRestrictions(): TransferRestriction[] {
    return [...this._transferRestrictions];
  }

  get closingConditions(): ClosingCondition[] {
    return [...this._closingConditions];
  }

  get status(): 'draft' | 'finalized' {
    return this._status;
  }

  get finalizedAt(): string | null {
    return this._finalizedAt;
  }

  get finalizedBy(): string | null {
    return this._finalizedBy;
  }

  addClosingCondition(condition: ClosingCondition): void {
    if (this._status === 'finalized') throw new Error('Term sheet is finalized and cannot be modified');
    this._closingConditions.push(condition);
  }

  markConditionMet(description: string): void {
    if (this._status === 'finalized') throw new Error('Term sheet is finalized and cannot be modified');
    const condition = this._closingConditions.find((c) => c.description === description);
    if (!condition) throw new Error(`Closing condition not found: ${description}`);
    condition.metAt = new Date().toISOString();
  }

  finalize(by: string): void {
    if (this._status === 'finalized') throw new Error('Term sheet already finalized');
    if (this._closingConditions.length === 0) {
      throw new Error('Term sheet cannot be finalized without closing conditions');
    }
    if (!this._economicRights) throw new Error('Term sheet cannot be finalized without economic rights');
    this._status = 'finalized';
    this._finalizedAt = new Date().toISOString();
    this._finalizedBy = by;
  }
}

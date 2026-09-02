import { TenantId, TransferabilityReviewDecision, TransferabilityStatus } from '@daos/shared-kernel';

export class AssetTransferability {
  private constructor(
    public readonly id: string,
    public readonly tenantId: TenantId,
    public readonly assetId: string,
    private _transferable: boolean,
    private _assignable: boolean,
    private _fractionalizable: boolean,
    private _tokenizable: boolean,
    private _beneficialInterestTransferable: boolean,
    private _issuerConsentRequired: boolean,
    private _ownerConsentRequired: boolean,
    private _regulatorApprovalRequired: boolean,
    private _geographicRestrictions: string[],
    private _investorRestrictions: string[],
    private _secondaryTransferRestrictions: string[],
    private _lockupDays: number | null,
    private _preEmptionRights: boolean,
    private _transferFees: string | null,
    private _transferDocumentation: string | null,
    private _legalOpinionRequired: boolean,
    private _status: TransferabilityStatus,
    private _evidenceReferences: string[],
    private _reviewer: string | null,
    private _assessmentDate: string | null,
    private _reviewDecision: TransferabilityReviewDecision | null,
    private _notes: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    assetId: string;
    transferable?: boolean;
    assignable?: boolean;
    fractionalizable?: boolean;
    tokenizable?: boolean;
    beneficialInterestTransferable?: boolean;
    issuerConsentRequired?: boolean;
    ownerConsentRequired?: boolean;
    regulatorApprovalRequired?: boolean;
    geographicRestrictions?: string[];
    investorRestrictions?: string[];
    secondaryTransferRestrictions?: string[];
    lockupDays?: number | null;
    preEmptionRights?: boolean;
    transferFees?: string | null;
    transferDocumentation?: string | null;
    legalOpinionRequired?: boolean;
  }): AssetTransferability {
    return new AssetTransferability(
      crypto.randomUUID(),
      params.tenantId,
      params.assetId,
      params.transferable ?? true,
      params.assignable ?? true,
      params.fractionalizable ?? false,
      params.tokenizable ?? false,
      params.beneficialInterestTransferable ?? true,
      params.issuerConsentRequired ?? false,
      params.ownerConsentRequired ?? false,
      params.regulatorApprovalRequired ?? false,
      params.geographicRestrictions ?? [],
      params.investorRestrictions ?? [],
      params.secondaryTransferRestrictions ?? [],
      params.lockupDays ?? null,
      params.preEmptionRights ?? false,
      params.transferFees ?? null,
      params.transferDocumentation ?? null,
      params.legalOpinionRequired ?? false,
      'NOT_ASSESSED',
      [],
      null,
      null,
      null,
      null,
    );
  }

  static reconstruct(params: {
    id: string;
    tenantId: TenantId;
    assetId: string;
    transferable: boolean;
    assignable: boolean;
    fractionalizable: boolean;
    tokenizable: boolean;
    beneficialInterestTransferable: boolean;
    issuerConsentRequired: boolean;
    ownerConsentRequired: boolean;
    regulatorApprovalRequired: boolean;
    geographicRestrictions: string[];
    investorRestrictions: string[];
    secondaryTransferRestrictions: string[];
    lockupDays: number | null;
    preEmptionRights: boolean;
    transferFees: string | null;
    transferDocumentation: string | null;
    legalOpinionRequired: boolean;
    status: TransferabilityStatus;
    evidenceReferences: string[];
    reviewer: string | null;
    assessmentDate: string | null;
    reviewDecision: TransferabilityReviewDecision | null;
    notes: string | null;
  }): AssetTransferability {
    return new AssetTransferability(
      params.id,
      params.tenantId,
      params.assetId,
      params.transferable,
      params.assignable,
      params.fractionalizable,
      params.tokenizable,
      params.beneficialInterestTransferable,
      params.issuerConsentRequired,
      params.ownerConsentRequired,
      params.regulatorApprovalRequired,
      params.geographicRestrictions,
      params.investorRestrictions,
      params.secondaryTransferRestrictions,
      params.lockupDays,
      params.preEmptionRights,
      params.transferFees,
      params.transferDocumentation,
      params.legalOpinionRequired,
      params.status,
      params.evidenceReferences,
      params.reviewer,
      params.assessmentDate,
      params.reviewDecision,
      params.notes,
    );
  }

  get transferable(): boolean {
    return this._transferable;
  }
  get assignable(): boolean {
    return this._assignable;
  }
  get fractionalizable(): boolean {
    return this._fractionalizable;
  }
  get tokenizable(): boolean {
    return this._tokenizable;
  }
  get beneficialInterestTransferable(): boolean {
    return this._beneficialInterestTransferable;
  }
  get issuerConsentRequired(): boolean {
    return this._issuerConsentRequired;
  }
  get ownerConsentRequired(): boolean {
    return this._ownerConsentRequired;
  }
  get regulatorApprovalRequired(): boolean {
    return this._regulatorApprovalRequired;
  }
  get geographicRestrictions(): string[] {
    return [...this._geographicRestrictions];
  }
  get investorRestrictions(): string[] {
    return [...this._investorRestrictions];
  }
  get secondaryTransferRestrictions(): string[] {
    return [...this._secondaryTransferRestrictions];
  }
  get lockupDays(): number | null {
    return this._lockupDays;
  }
  get preEmptionRights(): boolean {
    return this._preEmptionRights;
  }
  get transferFees(): string | null {
    return this._transferFees;
  }
  get transferDocumentation(): string | null {
    return this._transferDocumentation;
  }
  get legalOpinionRequired(): boolean {
    return this._legalOpinionRequired;
  }
  get status(): TransferabilityStatus {
    return this._status;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get reviewer(): string | null {
    return this._reviewer;
  }
  get assessmentDate(): string | null {
    return this._assessmentDate;
  }
  get reviewDecision(): TransferabilityReviewDecision | null {
    return this._reviewDecision;
  }
  get notes(): string | null {
    return this._notes;
  }

  update(params: Partial<{
    transferable: boolean;
    assignable: boolean;
    fractionalizable: boolean;
    tokenizable: boolean;
    beneficialInterestTransferable: boolean;
    issuerConsentRequired: boolean;
    ownerConsentRequired: boolean;
    regulatorApprovalRequired: boolean;
    geographicRestrictions: string[];
    investorRestrictions: string[];
    secondaryTransferRestrictions: string[];
    lockupDays: number | null;
    preEmptionRights: boolean;
    transferFees: string | null;
    transferDocumentation: string | null;
    legalOpinionRequired: boolean;
  }>): void {
    if (params.transferable !== undefined) this._transferable = params.transferable;
    if (params.assignable !== undefined) this._assignable = params.assignable;
    if (params.fractionalizable !== undefined) this._fractionalizable = params.fractionalizable;
    if (params.tokenizable !== undefined) this._tokenizable = params.tokenizable;
    if (params.beneficialInterestTransferable !== undefined) this._beneficialInterestTransferable = params.beneficialInterestTransferable;
    if (params.issuerConsentRequired !== undefined) this._issuerConsentRequired = params.issuerConsentRequired;
    if (params.ownerConsentRequired !== undefined) this._ownerConsentRequired = params.ownerConsentRequired;
    if (params.regulatorApprovalRequired !== undefined) this._regulatorApprovalRequired = params.regulatorApprovalRequired;
    if (params.geographicRestrictions !== undefined) this._geographicRestrictions = params.geographicRestrictions;
    if (params.investorRestrictions !== undefined) this._investorRestrictions = params.investorRestrictions;
    if (params.secondaryTransferRestrictions !== undefined) this._secondaryTransferRestrictions = params.secondaryTransferRestrictions;
    if (params.lockupDays !== undefined) this._lockupDays = params.lockupDays;
    if (params.preEmptionRights !== undefined) this._preEmptionRights = params.preEmptionRights;
    if (params.transferFees !== undefined) this._transferFees = params.transferFees;
    if (params.transferDocumentation !== undefined) this._transferDocumentation = params.transferDocumentation;
    if (params.legalOpinionRequired !== undefined) this._legalOpinionRequired = params.legalOpinionRequired;
  }

  completeAssessment(reviewer: string, decision: TransferabilityReviewDecision, notes?: string | null): void {
    if (this._status === 'ASSESSED' || this._status === 'REVIEWED') {
      throw new Error('Transferability assessment already completed');
    }
    this._status = 'ASSESSED';
    this._reviewer = reviewer;
    this._assessmentDate = new Date().toISOString();
    this._reviewDecision = decision;
    this._notes = notes ?? null;
  }

  markReviewed(): void {
    if (this._status !== 'ASSESSED') {
      throw new Error('Assessment must be completed before review');
    }
    this._status = 'REVIEWED';
  }

  addEvidenceReference(reference: string): void {
    if (!this._evidenceReferences.includes(reference)) {
      this._evidenceReferences.push(reference);
    }
  }
}

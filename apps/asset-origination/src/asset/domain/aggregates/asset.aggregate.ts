import { randomUUID } from 'node:crypto';

import {
  AggregateRoot,
  AssetClass,
  AssetId,
  AssetOriginationStatus,
  AssetSubClass,
  Collateral,
  DDRating,
  Money,
  OriginationSource,
  ProvenanceRecord,
  ScreeningCriteria,
  ScreeningCriterionResult,
  ScreeningDecision,
  TenantId,
  UtcInstant,
  ValuationMethodology,
} from '@daos/shared-kernel';
import { AssetQualificationResult } from '@daos/shared-kernel';

import { SponsorReference } from '../entities/sponsor-reference.entity';
import { AssetApproved } from '../events/asset-approved.event';
import { AssetOriginated } from '../events/asset-originated.event';
import { AssetRejected } from '../events/asset-rejected.event';
import { AssetStatusChanged } from '../events/asset-status-changed.event';
import { DueDiligenceCompleted } from '../events/due-diligence-completed.event';
import { ValuationUpdated } from '../events/valuation-updated.event';

export type AssetValuation = {
  fairValueMinorUnits: string;
  currency: string;
  methodology: ValuationMethodology;
  valuedAt: string | null;
};

export type AssetScreening = {
  screeningId: string;
  assetId: string;
  criteriaResults: Record<string, ScreeningCriterionResult>;
  decision: ScreeningDecision;
  score: number;
  maxScore: number;
  comments: string;
  reviewedBy: string;
  reviewedAt: string;
};

// Valid state transitions map
const VALID_TRANSITIONS: Record<AssetOriginationStatus, AssetOriginationStatus[]> = {
  DRAFT: ['ORIGINATED'],
  ORIGINATED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['QUALIFIED', 'REJECTED', 'WITHDRAWN'],
  QUALIFIED: ['DUE_DILIGENCE', 'REJECTED', 'WITHDRAWN'],
  DUE_DILIGENCE: ['VALUATION', 'ON_HOLD', 'REJECTED', 'WITHDRAWN'],
  VALUATION: ['RISK_REVIEW', 'ON_HOLD', 'REJECTED', 'WITHDRAWN'],
  RISK_REVIEW: ['READY_FOR_APPROVAL', 'ON_HOLD', 'REJECTED', 'WITHDRAWN'],
  READY_FOR_APPROVAL: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
  APPROVED: ['HANDED_OFF_TO_DEAL'],
  REJECTED: [],
  ON_HOLD: ['DUE_DILIGENCE', 'VALUATION', 'RISK_REVIEW', 'WITHDRAWN'],
  WITHDRAWN: [],
  HANDED_OFF_TO_DEAL: [],
};

export class Asset extends AggregateRoot {
  private constructor(
    public readonly id: AssetId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _assetClass: AssetClass,
    private _assetSubClass: AssetSubClass,
    private _sponsorId: string,
    private _status: AssetOriginationStatus,
    private _jurisdictions: string[],
    private _country: string,
    private _purchasePrice: Money | null,
    private _collateral: Collateral[],
    private _provenance: ProvenanceRecord[],
    private _valuation: AssetValuation | null,
    private _dueDiligenceRating: DDRating | null,
    private _approvedBy: string | null,
    private _rejectionReason: string | null,
    private _externalReference: string | null,
    private _internalReference: string | null,
    private _legalName: string,
    private _source: OriginationSource | null,
    private _screening: AssetScreening | null,
    private _qualification: AssetQualificationResult | null,
    private _sponsorReference: SponsorReference | null,
  ) {
    super();
  }

  static originate(params: {
    tenantId: TenantId;
    name: string;
    assetClass: AssetClass;
    assetSubClass: AssetSubClass;
    sponsorId: string;
    legalName: string;
    country: string;
    externalReference?: string | null;
    internalReference?: string | null;
    jurisdictions: string[];
    purchasePrice?: Money | null;
    collateral?: Collateral[];
    provenance?: ProvenanceRecord[];
    source?: Omit<OriginationSource, 'originatedAt'>;
  }): Asset {
    if (!params.name.trim()) throw new Error('Asset name is required');
    const source = params.source
      ? {
          sourceId: params.source.sourceId,
          sourceType: params.source.sourceType,
          sourceEntityId: params.source.sourceEntityId,
          sourceReference: params.source.sourceReference,
          originatedAt: UtcInstant.now(),
          submittedBy: params.source.submittedBy,
          relationshipManager: params.source.relationshipManager,
        }
      : null;
    const asset = new Asset(
      AssetId.create(),
      params.tenantId,
      params.name.trim(),
      params.assetClass,
      params.assetSubClass,
      params.sponsorId,
      'ORIGINATED',
      params.jurisdictions,
      params.country,
      params.purchasePrice ?? null,
      params.collateral ?? [],
      params.provenance ?? [],
      null,
      null,
      null,
      null,
      params.externalReference ?? null,
      params.internalReference ?? null,
      params.legalName,
      source,
      null,
      null,
      null,
    );
    asset.raise(new AssetOriginated(asset.id.value, asset.tenantId.value, asset._sponsorId, asset._assetClass));
    asset.incrementVersion();
    return asset;
  }

  static reconstruct(params: {
    id: AssetId;
    tenantId: TenantId;
    name: string;
    assetClass: AssetClass;
    assetSubClass: AssetSubClass;
    sponsorId: string;
    status: AssetOriginationStatus;
    jurisdictions: string[];
    country: string;
    purchasePrice: Money | null;
    collateral: Collateral[];
    provenance: ProvenanceRecord[];
    valuation: AssetValuation | null;
    dueDiligenceRating: DDRating | null;
    approvedBy: string | null;
    rejectionReason: string | null;
    version: number;
    externalReference: string | null;
    internalReference: string | null;
    legalName: string;
    source: OriginationSource | null;
    screening: AssetScreening | null;
    qualification: AssetQualificationResult | null;
    sponsorReference?: SponsorReference | null;
  }): Asset {
    const asset = new Asset(
      params.id,
      params.tenantId,
      params.name,
      params.assetClass,
      params.assetSubClass,
      params.sponsorId,
      params.status,
      params.jurisdictions,
      params.country,
      params.purchasePrice,
      params.collateral,
      params.provenance,
      params.valuation,
      params.dueDiligenceRating,
      params.approvedBy,
      params.rejectionReason,
      params.externalReference,
      params.internalReference,
      params.legalName,
      params.source,
      params.screening,
      params.qualification,
      params.sponsorReference ?? null,
    );
    asset._version = params.version;
    return asset;
  }

  get name(): string {
    return this._name;
  }

  get assetClass(): AssetClass {
    return this._assetClass;
  }

  get assetSubClass(): AssetSubClass {
    return this._assetSubClass;
  }

  get sponsorId(): string {
    return this._sponsorId;
  }

  get status(): AssetOriginationStatus {
    return this._status;
  }

  get jurisdictions(): string[] {
    return [...this._jurisdictions];
  }

  get country(): string {
    return this._country;
  }

  get purchasePrice(): Money | null {
    return this._purchasePrice;
  }

  get collateral(): Collateral[] {
    return [...this._collateral];
  }

  get provenance(): ProvenanceRecord[] {
    return [...this._provenance];
  }

  get valuation(): AssetValuation | null {
    return this._valuation;
  }

  get dueDiligenceRating(): DDRating | null {
    return this._dueDiligenceRating;
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get externalReference(): string | null {
    return this._externalReference;
  }

  get internalReference(): string | null {
    return this._internalReference;
  }

  get legalName(): string {
    return this._legalName;
  }

  get source(): OriginationSource | null {
    return this._source;
  }

  get screening(): AssetScreening | null {
    return this._screening;
  }

  get qualification(): AssetQualificationResult | null {
    return this._qualification;
  }

  get sponsorReference(): SponsorReference | null {
    return this._sponsorReference;
  }

  private canTransitionTo(newStatus: AssetOriginationStatus): boolean {
    const validTransitions = VALID_TRANSITIONS[this._status] || [];
    return validTransitions.includes(newStatus);
  }

  private transitionTo(newStatus: AssetOriginationStatus, reason: string, actor: string): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Invalid transition from ${this._status} to ${newStatus}`);
    }
    const previousStatus = this._status;
    this._status = newStatus;
    this.raise(
      new AssetStatusChanged(this.id.value, this.tenantId.value, previousStatus, newStatus, reason, actor),
    );
    this.incrementVersion();
  }

  startScreening(actor: string): void {
    if (this._status !== 'ORIGINATED') {
      throw new Error('Asset must be in ORIGINATED status to start screening');
    }
    this._screening = {
      screeningId: randomUUID(),
      assetId: this.id.value,
      criteriaResults: {},
      decision: 'PASS',
      score: 0,
      maxScore: 0,
      comments: '',
      reviewedBy: actor,
      reviewedAt: UtcInstant.now().toIso(),
    };
    this.transitionTo('SCREENING', 'Screening started', actor);
  }

  qualify(actor: string): void {
    this.transitionTo('QUALIFIED', 'Qualification completed', actor);
  }

  startDueDiligence(actor: string): void {
    this.transitionTo('DUE_DILIGENCE', 'Due diligence started', actor);
  }

  completeDueDiligence(rating: DDRating, actor: string): void {
    if (this._status !== 'DUE_DILIGENCE') {
      throw new Error(`Due diligence cannot be completed from status: ${this._status}`);
    }
    this._dueDiligenceRating = rating;
    this.raise(new DueDiligenceCompleted(this.id.value, this.tenantId.value, this._sponsorId, rating));
    this.transitionTo('VALUATION', 'Due diligence completed', actor);
  }

  updateValuation(valuation: AssetValuation, _actor: string): void {
    if (this._status === 'REJECTED' || this._status === 'WITHDRAWN') {
      throw new Error('Cannot update valuation for rejected or withdrawn assets');
    }
    if (this._status === 'APPROVED' || this._status === 'HANDED_OFF_TO_DEAL') {
      throw new Error('Cannot update valuation for approved or handed-off assets');
    }
    this._valuation = valuation;
    this.raise(
      new ValuationUpdated(
        this.id.value,
        this.tenantId.value,
        valuation.fairValueMinorUnits,
        valuation.methodology,
      ),
    );
    // Valuation does not change asset lifecycle status (AO-000).
    this.incrementVersion();
  }

  startRiskReview(actor: string): void {
    this.transitionTo('RISK_REVIEW', 'Risk review started', actor);
  }

  completeRiskReview(actor: string): void {
    this.transitionTo('READY_FOR_APPROVAL', 'Risk review completed', actor);
  }

  submitForApproval(actor: string): void {
    if (!this._valuation) {
      throw new Error('Asset cannot be submitted for approval without a valuation');
    }
    if (!this._dueDiligenceRating) {
      throw new Error('Asset cannot be submitted for approval without completed due diligence');
    }
    this.transitionTo('READY_FOR_APPROVAL', 'Submitted for approval', actor);
  }

  approve(approvedBy: string, actor: string): void {
    if (this._status !== 'READY_FOR_APPROVAL') {
      throw new Error(`Asset can only be approved from READY_FOR_APPROVAL status, current status: ${this._status}`);
    }
    if (!this._valuation) {
      throw new Error('Asset cannot be approved without a valuation');
    }
    if (!this._dueDiligenceRating) {
      throw new Error('Asset cannot be approved without completed due diligence');
    }
    this._approvedBy = approvedBy;
    this.transitionTo('APPROVED', `Approved by ${approvedBy}`, actor);
    this.raise(new AssetApproved(this.id.value, this.tenantId.value, approvedBy));
  }

  reject(reason: string, actor: string): void {
    if (this._status === 'APPROVED' || this._status === 'HANDED_OFF_TO_DEAL') {
      throw new Error('Cannot reject approved or handed-off assets');
    }
    if (this._status === 'REJECTED') {
      throw new Error('Asset is already rejected');
    }
    this._rejectionReason = reason;
    this.transitionTo('REJECTED', reason, actor);
    this.raise(new AssetRejected(this.id.value, this.tenantId.value, reason));
  }

  putOnHold(actor: string, reason: string): void {
    this.transitionTo('ON_HOLD', reason, actor);
  }

  resume(targetStatus: 'DUE_DILIGENCE' | 'VALUATION' | 'RISK_REVIEW', actor: string): void {
    if (this._status !== 'ON_HOLD') {
      throw new Error('Only assets on hold can be resumed');
    }
    this.transitionTo(targetStatus, 'Resumed from hold', actor);
  }

  withdraw(actor: string, reason: string): void {
    if (this._status === 'APPROVED' || this._status === 'HANDED_OFF_TO_DEAL') {
      throw new Error('Cannot withdraw approved or handed-off assets');
    }
    this.transitionTo('WITHDRAWN', reason, actor);
  }

  handoffToDeal(actor: string): void {
    if (this._status !== 'APPROVED') {
      throw new Error('Only approved assets can be handed off to Deal Studio');
    }
    this.transitionTo('HANDED_OFF_TO_DEAL', 'Handed off to Deal Studio', actor);
  }

  completeScreening(actor: string, criteriaResult: ScreeningCriteria): void {
    if (this._status !== 'SCREENING') {
      throw new Error('Asset must be in SCREENING status to complete screening');
    }
    let totalScore = 0;
    let maxScore = 0;
    const criteriaResults: Record<string, ScreeningCriterionResult> = {};

    if (criteriaResult.assetClassEligibility && this._assetClass in criteriaResult.assetClassEligibility) {
      const passes = criteriaResult.assetClassEligibility[this._assetClass];
      criteriaResults['assetClassEligibility'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }

    for (const jurisdiction of this._jurisdictions) {
      if (criteriaResult.jurisdictionEligibility && jurisdiction in criteriaResult.jurisdictionEligibility) {
        const passes = criteriaResult.jurisdictionEligibility[jurisdiction];
        criteriaResults[`jurisdiction:${jurisdiction}`] = passes ? 'PASS' : 'FAIL';
        if (passes) { totalScore++; }
        maxScore++;
      }
    }

    if (criteriaResult.minimumAssetValue && this._purchasePrice) {
      const passes = this._purchasePrice.amount >= criteriaResult.minimumAssetValue.amount;
      criteriaResults['minimumAssetValue'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }

    if (criteriaResult.maximumAssetValue && this._purchasePrice) {
      const passes = this._purchasePrice.amount <= criteriaResult.maximumAssetValue.amount;
      criteriaResults['maximumAssetValue'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }

    if (criteriaResult.minimumExpectedReturn !== undefined) {
      criteriaResults['minimumExpectedReturn'] = 'NOT_APPLICABLE';
      maxScore++;
    }

    if (criteriaResult.sponsorEligibility) {
      for (const [sponsorId, passes] of Object.entries(criteriaResult.sponsorEligibility)) {
        criteriaResults[`sponsor:${sponsorId}`] = passes ? 'PASS' : 'FAIL';
        if (passes) { totalScore++; }
        maxScore++;
      }
    }

    for (const restriction of criteriaResult.regulatoryRestrictions ?? []) {
      criteriaResults[`regulatory:${restriction}`] = 'NOT_APPLICABLE';
      maxScore++;
    }

    for (const restriction of criteriaResult.esgRestrictions ?? []) {
      criteriaResults[`esg:${restriction}`] = 'NOT_APPLICABLE';
      maxScore++;
    }

    if (criteriaResult.liquidityRequirements) {
      const minLiquidity = criteriaResult.liquidityRequirements.minimumDailyLiquidity;
      if (minLiquidity && this._purchasePrice) {
        const passes = this._purchasePrice.amount >= minLiquidity.amount;
        criteriaResults['liquidity'] = passes ? 'PASS' : 'FAIL';
        if (passes) { totalScore++; }
        maxScore++;
      }
    }

    for (const mandate of criteriaResult.tenantInvestmentMandates ?? []) {
      criteriaResults[`mandate:${mandate}`] = 'NOT_APPLICABLE';
      maxScore++;
    }

    const decision: ScreeningDecision = maxScore > 0 && totalScore / maxScore >= 0.75 ? 'PASS' : 'FAIL';

    this._screening = {
      screeningId: randomUUID(),
      assetId: this.id.value,
      criteriaResults,
      decision,
      score: totalScore,
      maxScore,
      comments: 'Screening completed',
      reviewedBy: actor,
      reviewedAt: UtcInstant.now().toIso(),
    };

    if (decision === 'PASS') {
      this.qualify(actor);
    } else {
      this.reject('Screening failed: criteria not met', actor);
    }
  }
}


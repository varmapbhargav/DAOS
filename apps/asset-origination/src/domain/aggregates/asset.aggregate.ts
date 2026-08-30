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
  TenantId,
  UtcInstant,
  ValuationMethodology,
} from '@daos/shared-kernel';
import { randomUUID } from 'node:crypto';

import { AssetApproved } from '../events/asset-approved.event';
import { AssetOriginated } from '../events/asset-originated.event';
import { AssetRejected } from '../events/asset-rejected.event';
import { AssetStatusChanged } from '../events/asset-status-changed.event';
import { DueDiligenceCompleted } from '../events/due-diligence-completed.event';
import { ValuationUpdated } from '../events/valuation-updated.event';
import { AssetLifecycleHistory, AssetLifecycleHistoryRepository } from '../entities/asset-lifecycle-history.entity';
import { SponsorReference, SponsorReferenceRepository } from '../entities/sponsor-reference.entity';
import { AssetId as AssetLifecycleId } from '@daos/shared-kernel';

export type AssetValuation = {
  fairValueMinorUnits: string;
  currency: string;
  methodology: ValuationMethodology;
  valuedAt: string | null;
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
    private _screening: {
      screeningId: string;
      assetId: string;
      criteriaResults: Record<string, string>;
      decision: ScreeningDecision;
      score: number;
      maxScore: number;
      comments: string;
      reviewedBy: string;
      reviewedAt: string;
    } | null,
    private _qualification: AssetQualificationResult | null,
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
      'DRAFT',
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

  get sponsorId(): string {
    return this._sponsorId;
  }

  get status(): AssetOriginationStatus {
    return this._status;
  }

  get jurisdictions(): string[] {
    return [...this._jurisdictions];
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

  get country(): string {
    return this._country;
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

  updateValuation(valuation: AssetValuation, actor: string): void {
    if (this._status === 'REJECTED' || this._status === 'WITHDRAWN') {
      throw new Error('Cannot update valuation for rejected or withdrawn assets');
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
    this.transitionTo(this._status, 'Valuation updated', actor);
    // Note: Status does NOT change to 'valuationUpdated' - that was the bug
    // Status remains in current state, valuation is just updated
    this.incrementVersion();
  }

  startRiskReview(actor: string): void {
    this.transitionTo('RISK_REVIEW', 'Risk review started', actor);
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
    this.sponsorRefRepo.save(
      this._sponsorReference!,
    );
  }

  handoffToDeal(actor: string): void {
    if (this._status !== 'APPROVED') {
      throw new Error('Only approved assets can be handed off to Deal Studio');
    }
    this.transitionTo('HANDED_OFF_TO_DEAL', 'Handed off to Deal Studio', actor);
  }

  startScreening(actor: string): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Asset must be in DRAFT status to start screening');
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
      reviewedAt: UtcInstant.now(),
    };
    this.transitionTo('SCREENING', 'Screening started', actor);
  }

  completeScreening(actor: string, criteriaResult: ScreeningCriteria): void {
    if (this._status !== 'SCREENING') {
      throw new Error('Asset must be in SCREENING status to complete screening');
    }
    // Calculate score and decision based on criteria
    let totalScore = 0;
    let maxScore = 0;
    const criteriaResults: Record<string, ScreeningCriterionResult> = {};
    
    // Asset class eligibility
    if (this._assetClass in criteriaResult.assetClassEligibility) {
      const passes = criteriaResult.assetClassEligibility[this._assetClass];
      criteriaResults['assetClassEligibility'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Jurisdiction eligibility
    for (const jurisdiction of this._jurisdictions) {
      if (jurisdiction in criteriaResult.jurisdictionEligibility) {
        const passes = criteriaResult.jurisdictionEligibility[jurisdiction];
        const key = `jurisdiction:${jurisdiction}`;
        criteriaResults[key] = passes ? 'PASS' : 'FAIL';
        if (passes) { totalScore++; }
        maxScore++;
      }
    }
    
    // Minimum asset value
    if (criteriaResult.minimumAssetValue && this._purchasePrice) {
      const passes = this._purchasePrice.amount >= criteriaResult.minimumAssetValue.amount;
      criteriaResults['minimumAssetValue'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Maximum asset value
    if (criteriaResult.maximumAssetValue && this._purchasePrice) {
      const passes = this._purchasePrice.amount <= criteriaResult.maximumAssetValue.amount;
      criteriaResults['maximumAssetValue'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Minimum expected return
    if (criteriaResult.minimumExpectedReturn !== undefined) {
      const passes = /* expected return check */ true; // placeholder
      criteriaResults['minimumExpectedReturn'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Sponsor eligibility
    for (const [sponsorId, passes] of Object.entries(criteriaResult.sponsorEligibility)) {
      criteriaResults[`sponsor:${sponsorId}`] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Regulatory restrictions
    for (const restriction of criteriaResult.regulatoryRestrictions) {
      criteriaResults[`regulatory:${restriction}`] = 'NOT_APPLICABLE';
    }
    if (criteriaResult.regulatoryRestrictions.length > 0) {
      maxScore += criteriaResult.regulatoryRestrictions.length;
    }
    
    // ESG restrictions
    for (const restriction of criteriaResult.esgRestrictions) {
      criteriaResults[`esg:${restriction}`] = 'NOT_APPLICABLE';
    }
    if (criteriaResult.esgRestrictions.length > 0) {
      maxScore += criteriaResult.esgRestrictions.length;
    }
    
    // Liquidity requirements
    if (criteriaResult.liquidityRequirements.minimumDailyLiquidity && this._purchasePrice) {
      const passes = this._purchasePrice.amount >= criteriaResult.liquidityRequirements.minimumDailyLiquidity.amount;
      criteriaResults['liquidity'] = passes ? 'PASS' : 'FAIL';
      if (passes) { totalScore++; }
      maxScore++;
    }
    
    // Tenant investment mandates
    for (const mandate of criteriaResult.tenantInvestmentMandates) {
      criteriaResults[`mandate:${mandate}`] = 'NOT_APPLICABLE';
    }
    if (criteriaResult.tenantInvestmentMandates.length > 0) {
      maxScore += criteriaResult.tenantInvestmentMandates.length;
    }
    
    const decision: ScreeningDecision = maxScore > 0 && totalScore / maxScore >= 0.75 ? 'PASS' : 'FAIL';
    const score = totalScore;
    const maxScoreValue = maxScore;
    
    this._screening = {
      screeningId: randomUUID(),
      assetId: this.id.value,
      criteriaResults,
      decision,
      score,
      maxScore: maxScoreValue,
      comments: 'Screening completed',
      reviewedBy: actor,
      reviewedAt: UtcInstant.now(),
    };
    
    if (decision === 'PASS') {
      this.qualify(actor);
    } else {
      this.reject('Screening failed: criteria not met', actor);
    }
  }

  withdraw(actor: string, reason: string): void {
    if (this._status === 'APPROVED' || this._status === 'HANDED_OFF_TO_DEAL') {
      throw new Error('Cannot withdraw approved or handed-off assets');
    }
    this.transitionTo('WITHDRAWN', reason, actor);
  }

import {
  AggregateRoot,
  AssetReference,
  CapitalStack,
  ClosingCondition,
  DEAL_STATUS_TRANSITIONS,
  DealDocumentReference,
  DealEconomicsData,
  DealEntityReference,
  DealId,
  DealMetadata,
  DealStatus,
  EconomicRights,
  GovernanceTerms,
  OpportunityReference,
  ParticipantRole,
  StoredEvent,
  TenantId,
} from '@daos/shared-kernel';

import { TermsChanged } from '../events/terms-changed.event';
import { ParticipantChanged } from '../events/participant-changed.event';
import { ApprovalChanged } from '../events/approval-changed.event';
import { ClosingConditionChanged } from '../events/closing-condition-changed.event';

import { DealParticipant } from '../entities/deal-participant.entity';
import { DealStatusHistory } from '../entities/deal-status-history.entity';
import { CapitalStackUpdated } from '../events/capital-stack-updated.event';
import { DealApproved } from '../events/deal-approved.event';
import { DealCancelled } from '../events/deal-cancelled.event';
import { DealClosed } from '../events/deal-closed.event';
import { DealClosingStarted } from '../events/deal-closing-started.event';
import { DealCreated } from '../events/deal-created.event';
import { DealExpired } from '../events/deal-expired.event';
import { DealOnHold } from '../events/deal-on-hold.event';
import { DealReadyForClosing } from '../events/deal-ready-for-closing.event';
import { DealRejected } from '../events/deal-rejected.event';
import { DealResumed } from '../events/deal-resumed.event';
import { DealStructuringStarted } from '../events/deal-structuring-started.event';
import { DealSubmittedForApproval } from '../events/deal-submitted-for-approval.event';
import { DealSubmittedForLegalReview } from '../events/deal-submitted-for-legal-review.event';
import { LegalReviewCompleted } from '../events/legal-review-completed.event';
import { CapitalStackValidator } from '../services/capital-stack-validator';
import { ClosingConditionChecker } from '../services/closing-condition-checker';

export class Deal extends AggregateRoot {
  private _statusHistory: DealStatusHistory[] = [];
  private _participants: DealParticipant[] = [];
  private _documents: DealDocumentReference[] = [];
  private _assetReferences: AssetReference[] = [];
  private _entityReferences: DealEntityReference[] = [];
  private _opportunityReference: OpportunityReference | null = null;

  private constructor(
    public readonly id: DealId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _assetId: string,
    private _sponsorId: string,
    private _status: DealStatus,
    private _metadata: DealMetadata | null,
    private _capitalStack: CapitalStack | null,
    private _economicRights: EconomicRights | null,
    private _governanceTerms: GovernanceTerms | null,
    private _closingConditions: ClosingCondition[],
    private _economics: DealEconomicsData | null,
    private _approvedBy: string | null,
    private _approvedAt: string | null,
    private _rejectedBy: string | null,
    private _rejectedAt: string | null,
    private _rejectionReason: string | null,
    private _closedAt: string | null,
    private _holdReason: string | null,
    private _previousStatusBeforeHold: DealStatus | null,
    private _idempotencyKey: string | null,
    private _correlationId: string | null,
  ) {
    super();
  }

  // ─── Factory: Create ────────────────────────────────────────────────────────

  static create(params: {
    tenantId: TenantId;
    name: string;
    assetId: string;
    sponsorId: string;
    metadata?: DealMetadata | null;
    capitalStack?: CapitalStack | null;
    economicRights?: EconomicRights | null;
    governanceTerms?: GovernanceTerms | null;
    closingConditions?: ClosingCondition[];
    opportunityId?: string;
    idempotencyKey?: string;
    correlationId?: string;
    actorId: string;
  }): Deal {
    if (!params.name.trim()) throw new Error('Deal name is required');
    if (!params.assetId.trim()) throw new Error('Asset ID is required');
    if (!params.sponsorId.trim()) throw new Error('Sponsor ID is required');

    const deal = new Deal(
      DealId.create(),
      params.tenantId,
      params.name.trim(),
      params.assetId,
      params.sponsorId,
      'DRAFT',
      params.metadata ?? null,
      params.capitalStack ?? null,
      params.economicRights ?? null,
      params.governanceTerms ?? null,
      params.closingConditions ?? [],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      params.idempotencyKey ?? null,
      params.correlationId ?? null,
    );

    if (params.opportunityId) {
      deal._opportunityReference = {
        opportunityId: params.opportunityId,
        approvedAt: null,
      };
    }

    const history = DealStatusHistory.record({
      dealId: deal.id.value,
      tenantId: deal.tenantId.value,
      previousStatus: null,
      newStatus: 'DRAFT',
      reason: 'Deal created',
      changedBy: params.actorId,
    });
    deal._statusHistory.push(history);

    deal.raise(
      new DealCreated(
        deal.id.value,
        deal.tenantId.value,
        params.actorId,
        deal._name,
        deal._assetId,
        deal._sponsorId,
      ),
    );
    deal.incrementVersion();
    return deal;
  }

  // ─── Legacy factory (backward compat) ───────────────────────────────────────

  static structure(params: {
    tenantId: TenantId;
    name: string;
    assetId: string;
    sponsorId: string;
    capitalStack?: CapitalStack | null;
    economicRights?: EconomicRights | null;
    governanceTerms?: GovernanceTerms | null;
    closingConditions?: ClosingCondition[];
  }): Deal {
    return Deal.create({
      ...params,
      actorId: 'system',
    });
  }

  // ─── Reconstruct ────────────────────────────────────────────────────────────

  static reconstruct(params: {
    id: DealId;
    tenantId: TenantId;
    name: string;
    assetId: string;
    sponsorId: string;
    status: DealStatus;
    metadata: DealMetadata | null;
    capitalStack: CapitalStack | null;
    economicRights: EconomicRights | null;
    governanceTerms: GovernanceTerms | null;
    closingConditions: ClosingCondition[];
    economics: DealEconomicsData | null;
    approvedBy: string | null;
    approvedAt: string | null;
    rejectedBy: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    closedAt: string | null;
    holdReason: string | null;
    previousStatusBeforeHold: DealStatus | null;
    idempotencyKey: string | null;
    correlationId: string | null;
    statusHistory: DealStatusHistory[];
    participants: DealParticipant[];
    documents: DealDocumentReference[];
    assetReferences: AssetReference[];
    entityReferences: DealEntityReference[];
    opportunityReference: OpportunityReference | null;
    version: number;
  }): Deal {
    const deal = new Deal(
      params.id,
      params.tenantId,
      params.name,
      params.assetId,
      params.sponsorId,
      params.status,
      params.metadata,
      params.capitalStack,
      params.economicRights,
      params.governanceTerms,
      params.closingConditions,
      params.economics,
      params.approvedBy,
      params.approvedAt,
      params.rejectedBy,
      params.rejectedAt,
      params.rejectionReason,
      params.closedAt,
      params.holdReason,
      params.previousStatusBeforeHold,
      params.idempotencyKey,
      params.correlationId,
    );
    deal._statusHistory = params.statusHistory;
    deal._participants = params.participants;
    deal._documents = params.documents;
    deal._assetReferences = params.assetReferences;
    deal._entityReferences = params.entityReferences;
    deal._opportunityReference = params.opportunityReference;
    deal._version = params.version;
    return deal;
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get name(): string { return this._name; }
  get assetId(): string { return this._assetId; }
  get sponsorId(): string { return this._sponsorId; }
  get status(): DealStatus { return this._status; }
  get metadata(): DealMetadata | null { return this._metadata; }
  get capitalStack(): CapitalStack | null { return this._capitalStack; }
  get economicRights(): EconomicRights | null { return this._economicRights; }
  get governanceTerms(): GovernanceTerms | null { return this._governanceTerms; }
  get closingConditions(): ClosingCondition[] { return [...this._closingConditions]; }
  get economics(): DealEconomicsData | null { return this._economics; }
  get approvedBy(): string | null { return this._approvedBy; }
  get approvedAt(): string | null { return this._approvedAt; }
  get rejectedBy(): string | null { return this._rejectedBy; }
  get rejectedAt(): string | null { return this._rejectedAt; }
  get rejectionReason(): string | null { return this._rejectionReason; }
  get closedAt(): string | null { return this._closedAt; }
  get holdReason(): string | null { return this._holdReason; }
  get previousStatusBeforeHold(): DealStatus | null { return this._previousStatusBeforeHold; }
  get idempotencyKey(): string | null { return this._idempotencyKey; }
  get correlationId(): string | null { return this._correlationId; }
  get statusHistory(): DealStatusHistory[] { return [...this._statusHistory]; }
  get participants(): DealParticipant[] { return [...this._participants]; }
  get documents(): DealDocumentReference[] { return [...this._documents]; }
  get assetReferences(): AssetReference[] { return [...this._assetReferences]; }
  get entityReferences(): DealEntityReference[] { return [...this._entityReferences]; }
  get opportunityReference(): OpportunityReference | null { return this._opportunityReference; }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private transition(to: DealStatus, reason: string, actorId: string): void {
    const allowed = DEAL_STATUS_TRANSITIONS[this._status];
    if (!allowed.includes(to)) {
      throw new Error(
        `Invalid status transition: ${this._status} → ${to}. Allowed: [${allowed.join(', ')}]`,
      );
    }
    const history = DealStatusHistory.record({
      dealId: this.id.value,
      tenantId: this.tenantId.value,
      previousStatus: this._status,
      newStatus: to,
      reason,
      changedBy: actorId,
    });
    this._statusHistory.push(history);
    this._status = to;
    this.incrementVersion();
  }

  private guardMutable(): void {
    if (this._status === 'CLOSED') throw new Error('Closed deals cannot be modified');
    if (this._status === 'CANCELLED') throw new Error('Cancelled deals cannot be modified');
    if (this._status === 'REJECTED') throw new Error('Rejected deals cannot be modified');
    if (this._status === 'EXPIRED') throw new Error('Expired deals cannot be modified');
  }

  // ─── Lifecycle Commands ─────────────────────────────────────────────────────

  startStructuring(actorId: string, reason = 'Structuring started'): void {
    this.transition('STRUCTURING', reason, actorId);
    this.raise(new DealStructuringStarted(this.id.value, this.tenantId.value, actorId));
  }

  updateCapitalStack(stack: CapitalStack, validator: CapitalStackValidator, actorId = 'system'): void {
    this.guardMutable();
    if (this._status === 'ON_HOLD') throw new Error('Cannot update capital stack while deal is on hold');
    const validation = validator.validate(stack);
    if (!validation.valid) {
      throw new Error(`Invalid capital stack: ${validation.errors.join('; ')}`);
    }
    this._capitalStack = stack;
    if (this._status === 'DRAFT') {
      this.transition('STRUCTURING', 'Capital stack updated, moved to structuring', actorId);
    } else {
      this.incrementVersion();
    }
    this.raise(new CapitalStackUpdated(this.id.value, this.tenantId.value, actorId));
  }

  submitForLegalReview(actorId: string, reason = 'Term sheet ready, submitted for legal review'): void {
    this.guardMutable();
    if (this._status === 'ON_HOLD') throw new Error('Resume the deal before submitting for legal review');
    const previousStatus = this._status;
    this.transition('LEGAL_REVIEW', reason, actorId);
    this.raise(new TermsChanged(this.id.value, this.tenantId.value, actorId, previousStatus, 'LEGAL_REVIEW'));
    this.raise(new DealSubmittedForLegalReview(this.id.value, this.tenantId.value, actorId));
  }

  completeLegalReview(actorId: string, reason = 'Legal review completed'): void {
    this.guardMutable();
    this.transition('READY_FOR_APPROVAL', reason, actorId);
    this.raise(new LegalReviewCompleted(this.id.value, this.tenantId.value, actorId));
  }

  submitForApproval(actorId: string, workflowId: string, reason = 'Submitted for investment committee approval'): void {
    this.guardMutable();
    this.transition('READY_FOR_APPROVAL', reason, actorId);
    this.raise(new ApprovalChanged(this.id.value, this.tenantId.value, actorId, 'READY_FOR_APPROVAL', 'READY_FOR_APPROVAL', workflowId));
    this.raise(new DealSubmittedForApproval(this.id.value, this.tenantId.value, actorId, workflowId));
  }

  markApproved(actorId: string, reason = 'Deal approved by investment committee'): void {
    this.guardMutable();
    const previousStatus = this._status;
    this.transition('APPROVED', reason, actorId);
    this._approvedBy = actorId;
    this._approvedAt = new Date().toISOString();
    this.raise(new ApprovalChanged(this.id.value, this.tenantId.value, actorId, previousStatus, 'APPROVED', this._approvedBy! ?? ''));
    this.raise(new DealApproved(this.id.value, this.tenantId.value, actorId));
  }

  markRejected(actorId: string, rejectionReason: string): void {
    this.guardMutable();
    this._rejectedBy = actorId;
    this._rejectedAt = new Date().toISOString();
    this._rejectionReason = rejectionReason;
    this.transition('REJECTED', rejectionReason, actorId);
    this.raise(new DealRejected(this.id.value, this.tenantId.value, actorId, rejectionReason));
  }

  prepareForClosing(actorId: string, reason = 'Deal ready for closing'): void {
    this.guardMutable();
    this.transition('READY_TO_CLOSE', reason, actorId);
    this.raise(new DealReadyForClosing(this.id.value, this.tenantId.value, actorId));
  }

  startClosing(actorId: string, reason = 'Closing process initiated'): void {
    this.guardMutable();
    this.transition('CLOSING', reason, actorId);
    this.raise(new DealClosingStarted(this.id.value, this.tenantId.value, actorId));
  }

  close(actorId: string, checker: ClosingConditionChecker): void {
    this.guardMutable();
    if (this._status !== 'CLOSING') {
      throw new Error(`Deal must be in CLOSING status to close, was: ${this._status}`);
    }
    const check = checker.check(this._closingConditions);
    if (!check.allMet) {
      throw new Error(`Cannot close deal — unmet conditions: ${check.pending.join(', ')}`);
    }
    this._closedAt = new Date().toISOString();
    this.transition('CLOSED', 'Deal closed', actorId);
    this.raise(new DealClosed(this.id.value, this.tenantId.value, actorId));
  }

  putOnHold(actorId: string, holdReason: string): void {
    this.guardMutable();
    if (this._status === 'ON_HOLD') throw new Error('Deal is already on hold');
    this._holdReason = holdReason;
    this._previousStatusBeforeHold = this._status;
    this.transition('ON_HOLD', holdReason, actorId);
    this.raise(new DealOnHold(this.id.value, this.tenantId.value, actorId, holdReason));
  }

  resume(actorId: string, reason = 'Deal resumed'): void {
    if (this._status !== 'ON_HOLD') throw new Error('Deal is not on hold');
    const resumeStatus = this._previousStatusBeforeHold ?? 'STRUCTURING';
    this._holdReason = null;
    this._previousStatusBeforeHold = null;
    this.transition(resumeStatus, reason, actorId);
    this.raise(new DealResumed(this.id.value, this.tenantId.value, actorId));
  }

  cancel(actorId: string, reason: string): void {
    if (this._status === 'CLOSED') throw new Error('Closed deals cannot be cancelled');
    if (this._status === 'CANCELLED') throw new Error('Deal is already cancelled');
    this.transition('CANCELLED', reason, actorId);
    this.raise(new DealCancelled(this.id.value, this.tenantId.value, reason));
  }

  expire(actorId: string, reason = 'Deal expired'): void {
    this.transition('EXPIRED', reason, actorId);
    this.raise(new DealExpired(this.id.value, this.tenantId.value, actorId, reason));
  }

  // ─── Term Sheet / Conditions (kept for compat) ───────────────────────────────

  finalizeTermSheet(actorId: string): void {
    this.guardMutable();
    if (this._status !== 'STRUCTURING') {
      throw new Error(`Cannot finalize term sheet from status: ${this._status}`);
    }
    const previousStatus = this._status;
    this.transition('TERM_SHEET_READY', 'Term sheet finalized', actorId);
    this.raise(new TermsChanged(this.id.value, this.tenantId.value, actorId, previousStatus, 'TERM_SHEET_READY'));
  }

  addClosingCondition(condition: ClosingCondition, actorId = 'system'): void {
    this.guardMutable();
    this._closingConditions.push(condition);
    this.incrementVersion();
  }

  meetClosingCondition(description: string): void {
    const condition = this._closingConditions.find((c) => c.description === description);
    if (!condition) throw new Error(`Closing condition not found: ${description}`);
    if (condition.metAt !== null) return;
    condition.metAt = new Date().toISOString();
    condition.status = 'MET';
    this.incrementVersion();
  }

  verifyClosingCondition(conditionId: string, verifiedBy: string, evidenceRef?: string): void {
    const condition = this._closingConditions.find((c) => (c as any).conditionId === conditionId || c.description === conditionId);
    if (!condition) throw new Error(`Closing condition not found: ${conditionId}`);
    const previousStatus = condition.status;
    condition.status = 'MET';
    condition.verifiedBy = verifiedBy;
    condition.verifiedAt = new Date().toISOString();
    condition.metAt = condition.verifiedAt;
    if (evidenceRef && condition.evidence) {
      condition.evidence.documentReference = evidenceRef;
      condition.evidence.verificationDate = condition.verifiedAt;
    }
    this.incrementVersion();
    this.raise(new ClosingConditionChanged(this.id.value, this.tenantId.value, verifiedBy, conditionId, 'MET', previousStatus, 'MET'));
  }

  waiveClosingCondition(conditionId: string, waivedBy: string, reason: string): void {
    const condition = this._closingConditions.find((c) => (c as any).conditionId === conditionId || c.description === conditionId);
    if (!condition) throw new Error(`Closing condition not found: ${conditionId}`);
    const previousStatus = condition.status;
    condition.status = 'WAIVED';
    if (condition.evidence) {
      condition.evidence.waiverApprovedBy = waivedBy;
      condition.evidence.rejectionReason = reason;
    }
    condition.metAt = new Date().toISOString();
    this.incrementVersion();
    this.raise(new ClosingConditionChanged(this.id.value, this.tenantId.value, waivedBy, conditionId, 'WAIVED', previousStatus));
  }

  // ─── Participants ───────────────────────────────────────────────────────────

  addParticipant(entityId: string, role: ParticipantRole): DealParticipant {
    this.guardMutable();
    const existing = this._participants.find(
      (p) => p.entityId === entityId && p.role === role && p.status === 'ACTIVE',
    );
    if (existing) throw new Error(`Participant ${entityId} already has role ${role}`);
    const participant = DealParticipant.add({
      dealId: this.id.value,
      tenantId: this.tenantId.value,
      entityId,
      role,
    });
    this._participants.push(participant);
    this.incrementVersion();
    this.raise(new ParticipantChanged(this.id.value, this.tenantId.value, 'system', participant.id.value, 'ADDED'));
    return participant;
  }

  removeParticipant(participantId: string): void {
    const participant = this._participants.find((p) => p.id.value === participantId);
    if (!participant) throw new Error(`Participant not found: ${participantId}`);
    participant.deactivate();
    this.incrementVersion();
    this.raise(new ParticipantChanged(this.id.value, this.tenantId.value, 'system', participantId, 'REMOVED'));
  }

  // ─── Metadata ───────────────────────────────────────────────────────────────

  rename(name: string): void {
    this.guardMutable();
    this._name = name;
    this.incrementVersion();
  }

  updateMetadata(metadata: DealMetadata): void {
    this.guardMutable();
    this._metadata = metadata;
    this.incrementVersion();
  }

  updateEconomics(economics: DealEconomicsData): void {
    this.guardMutable();
    this._economics = economics;
    this.incrementVersion();
  }

  // ─── External References ────────────────────────────────────────────────────

  linkAsset(ref: AssetReference): void {
    this.guardMutable();
    const existing = this._assetReferences.find((a) => a.assetId === ref.assetId);
    if (!existing) {
      this._assetReferences.push(ref);
      this.incrementVersion();
    }
  }

  linkEntity(ref: DealEntityReference): void {
    this.guardMutable();
    const existing = this._entityReferences.find(
      (e) => e.entityId === ref.entityId && e.role === ref.role,
    );
    if (!existing) {
      this._entityReferences.push(ref);
      this.incrementVersion();
    }
  }

  linkOpportunity(opportunityId: string, approvedAt?: string): void {
    if (this._opportunityReference?.opportunityId === opportunityId) return;
    this._opportunityReference = { opportunityId, approvedAt: approvedAt ?? null };
    this.incrementVersion();
  }

  // ─── Documents ──────────────────────────────────────────────────────────────

  addDocument(doc: DealDocumentReference): void {
    this.guardMutable();
    this._documents.push(doc);
    this.incrementVersion();
  }

  // ─── Legacy compat (kept so existing commands still compile) ────────────────

  /** @deprecated Use markApproved() */
  approve(actorId: string, checker: ClosingConditionChecker): void {
    this.markApproved(actorId);
  }

  // ─── Event Sourcing: apply events to reconstruct state ──────────────────

  protected when(event: StoredEvent): void {
    const p = event.payload as Record<string, unknown>;
    switch (event.eventType) {
      case 'deal.created.v1':
        this._status = 'DRAFT';
        this._name = (p['name'] as string) ?? this._name;
        this._assetId = (p['assetId'] as string) ?? this._assetId;
        this._sponsorId = (p['sponsorId'] as string) ?? this._sponsorId;
        break;

      case 'deal.structuring.started.v1':
        this._status = 'STRUCTURING';
        break;

      case 'deal.terms.changed.v1':
        this._status = (p['newStatus'] as DealStatus) ?? this._status;
        break;

      case 'deal.submitted-for-legal-review.v1':
        this._status = 'LEGAL_REVIEW';
        break;

      case 'deal.legal-review.completed.v1':
        this._status = 'READY_FOR_APPROVAL';
        break;

      case 'deal.submitted-for-approval.v1':
        this._status = 'READY_FOR_APPROVAL';
        break;

      case 'deal.approved.v1':
        this._status = 'APPROVED';
        this._approvedBy = (p['actorId'] as string) ?? null;
        this._approvedAt = event.occurredAt;
        break;

      case 'deal.rejected.v1':
        this._status = 'REJECTED';
        this._rejectedBy = (p['actorId'] as string) ?? null;
        this._rejectedAt = event.occurredAt;
        this._rejectionReason = (p['reason'] as string) ?? null;
        break;

      case 'deal.ready-for-closing.v1':
        this._status = 'READY_TO_CLOSE';
        break;

      case 'deal.closing.started.v1':
        this._status = 'CLOSING';
        break;

      case 'deal.closed.v1':
        this._status = 'CLOSED';
        this._closedAt = event.occurredAt;
        break;

      case 'deal.on-hold.v1':
        this._previousStatusBeforeHold = this._status;
        this._holdReason = (p['reason'] as string) ?? null;
        this._status = 'ON_HOLD';
        break;

      case 'deal.resumed.v1':
        this._holdReason = null;
        this._status = this._previousStatusBeforeHold ?? 'STRUCTURING';
        this._previousStatusBeforeHold = null;
        break;

      case 'deal.cancelled.v1':
        this._status = 'CANCELLED';
        break;

      case 'deal.expired.v1':
        this._status = 'EXPIRED';
        break;

      case 'deal.capital-stack.updated.v1':
        break;

      case 'deal.participant.changed.v1':
        break;

      case 'deal.closing-condition.changed.v1':
        break;

      case 'deal.approval.changed.v1':
        break;

      case 'deal.scenario.calculated.v1':
        break;

      default:
        break;
    }
  }
}

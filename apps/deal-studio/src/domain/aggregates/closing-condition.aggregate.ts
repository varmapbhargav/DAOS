import {
  AggregateRoot,
  ClosingConditionCategory,
  ClosingConditionId,
  ClosingConditionStatus,
  ConditionEvidence,
  TenantId,
} from '@daos/shared-kernel';

import { ClosingConditionCreated } from '../events/closing-condition-created.event';
import { ClosingConditionMet } from '../events/closing-condition-met.event';
import { ClosingConditionWaived } from '../events/closing-condition-waived.event';

export class ClosingCondition extends AggregateRoot {
  private constructor(
    public readonly id: ClosingConditionId,
    public readonly dealId: string,
    public readonly tenantId: TenantId,
    private _category: ClosingConditionCategory,
    private _conditionType: string,
    private _description: string,
    private _responsibleParty: string | null,
    private _dueDate: string | null,
    private _status: ClosingConditionStatus,
    private _evidence: ConditionEvidence | null,
    private _verifiedBy: string | null,
    private _verifiedAt: string | null,
  ) {
    super();
  }

  // ─── Factory ─────────────────────────────────────────────────────────────────

  static create(params: {
    dealId: string;
    tenantId: TenantId;
    category: ClosingConditionCategory;
    conditionType: string;
    description: string;
    responsibleParty?: string;
    dueDate?: string;
    actorId: string;
  }): ClosingCondition {
    if (!params.description.trim()) throw new Error('Closing condition description is required');

    const cc = new ClosingCondition(
      ClosingConditionId.create(),
      params.dealId,
      params.tenantId,
      params.category,
      params.conditionType,
      params.description.trim(),
      params.responsibleParty ?? null,
      params.dueDate ?? null,
      'PENDING',
      null,
      null,
      null,
    );
    cc.raise(
      new ClosingConditionCreated(
        cc.dealId,
        cc.tenantId.value,
        params.actorId,
        cc._description,
        cc._category,
      ),
    );
    cc.incrementVersion();
    return cc;
  }

  static reconstruct(params: {
    id: ClosingConditionId;
    dealId: string;
    tenantId: TenantId;
    category: ClosingConditionCategory;
    conditionType: string;
    description: string;
    responsibleParty: string | null;
    dueDate: string | null;
    status: ClosingConditionStatus;
    evidence: ConditionEvidence | null;
    verifiedBy: string | null;
    verifiedAt: string | null;
    version: number;
  }): ClosingCondition {
    const cc = new ClosingCondition(
      params.id,
      params.dealId,
      params.tenantId,
      params.category,
      params.conditionType,
      params.description,
      params.responsibleParty,
      params.dueDate,
      params.status,
      params.evidence,
      params.verifiedBy,
      params.verifiedAt,
    );
    cc._version = params.version;
    return cc;
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get category(): ClosingConditionCategory { return this._category; }
  get conditionType(): string { return this._conditionType; }
  get description(): string { return this._description; }
  get responsibleParty(): string | null { return this._responsibleParty; }
  get dueDate(): string | null { return this._dueDate; }
  get status(): ClosingConditionStatus { return this._status; }
  get evidence(): ConditionEvidence | null { return this._evidence; }
  get verifiedBy(): string | null { return this._verifiedBy; }
  get verifiedAt(): string | null { return this._verifiedAt; }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  private _guardOpen(): void {
    if (this._status === 'MET') throw new Error('Condition already met');
    if (this._status === 'WAIVED') throw new Error('Condition already waived');
    if (this._status === 'FAILED') throw new Error('Condition has failed');
    if (this._status === 'EXPIRED') throw new Error('Condition has expired');
  }

  startProgress(responsibleParty: string): void {
    this._guardOpen();
    if (this._status !== 'PENDING') throw new Error('Can only start progress from PENDING');
    this._status = 'IN_PROGRESS';
    this._responsibleParty = responsibleParty;
    this.incrementVersion();
  }

  submit(evidence: ConditionEvidence): void {
    this._guardOpen();
    if (!['IN_PROGRESS', 'PENDING'].includes(this._status)) {
      throw new Error(`Cannot submit condition from status: ${this._status}`);
    }
    this._status = 'SUBMITTED';
    this._evidence = evidence;
    this.incrementVersion();
  }

  startReview(): void {
    this._guardOpen();
    if (this._status !== 'SUBMITTED') throw new Error('Condition must be submitted before review');
    this._status = 'UNDER_REVIEW';
    this.incrementVersion();
  }

  verify(verifiedBy: string, evidenceRef?: string): void {
    this._guardOpen();
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(this._status)) {
      throw new Error(`Cannot verify condition from status: ${this._status}`);
    }
    this._status = 'MET';
    this._verifiedBy = verifiedBy;
    this._verifiedAt = new Date().toISOString();

    if (evidenceRef) {
      this._evidence = this._evidence ?? {
        documentReference: null,
        uploadReference: null,
        reviewer: verifiedBy,
        verificationDate: this._verifiedAt,
        rejectionReason: null,
        waiverApprovedBy: null,
      };
      this._evidence.documentReference = evidenceRef;
      this._evidence.verificationDate = this._verifiedAt;
      this._evidence.reviewer = verifiedBy;
    }

    this.raise(
      new ClosingConditionMet(
        this.dealId,
        this.tenantId.value,
        this._description,
        verifiedBy,
      ),
    );
    this.incrementVersion();
  }

  waive(waivedBy: string, reason: string): void {
    if (this._status === 'MET') throw new Error('Cannot waive an already-met condition');
    if (this._status === 'WAIVED') throw new Error('Condition already waived');

    this._status = 'WAIVED';
    this._evidence = this._evidence ?? {
      documentReference: null,
      uploadReference: null,
      reviewer: waivedBy,
      verificationDate: new Date().toISOString(),
      rejectionReason: reason,
      waiverApprovedBy: waivedBy,
    };
    this._evidence.waiverApprovedBy = waivedBy;
    this._evidence.rejectionReason = reason;

    this.raise(
      new ClosingConditionWaived(
        this.dealId,
        this.tenantId.value,
        waivedBy,
        this._description,
        reason,
      ),
    );
    this.incrementVersion();
  }

  fail(reason: string): void {
    this._guardOpen();
    this._status = 'FAILED';
    if (this._evidence) this._evidence.rejectionReason = reason;
    this.incrementVersion();
  }

  expire(): void {
    if (['MET', 'WAIVED', 'FAILED', 'EXPIRED'].includes(this._status)) return;
    this._status = 'EXPIRED';
    this.incrementVersion();
  }
}

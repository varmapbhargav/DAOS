import { DataRequestId, DataRequestStatus, DataRequestType, TenantId, UtcInstant } from '@daos/shared-kernel';

export type DataRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export class DataRequest {
  private constructor(
    public readonly id: DataRequestId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _requestedFrom: string,
    private _requestedBy: string,
    private _requestType: DataRequestType,
    private _description: string,
    private _priority: DataRequestPriority,
    private _requiredBy: string | null,
    private _status: DataRequestStatus,
    private _response: string | null,
    private _evidenceReferences: string[],
    private _createdAt: string,
    private _completedAt: string | null,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    requestedFrom: string;
    requestedBy: string;
    requestType: DataRequestType;
    description: string;
    priority?: DataRequestPriority;
    requiredBy?: string | null;
  }): DataRequest {
    return new DataRequest(
      DataRequestId.create(),
      params.tenantId,
      params.caseId,
      params.requestedFrom,
      params.requestedBy,
      params.requestType,
      params.description,
      params.priority ?? 'MEDIUM',
      params.requiredBy ?? null,
      'REQUESTED',
      null,
      [],
      UtcInstant.now().toIso(),
      null,
    );
  }

  static reconstruct(params: {
    id: DataRequestId;
    tenantId: TenantId;
    caseId: string;
    requestedFrom: string;
    requestedBy: string;
    requestType: DataRequestType;
    description: string;
    priority: DataRequestPriority;
    requiredBy: string | null;
    status: DataRequestStatus;
    response: string | null;
    evidenceReferences: string[];
    createdAt: string;
    completedAt: string | null;
  }): DataRequest {
    return new DataRequest(
      params.id,
      params.tenantId,
      params.caseId,
      params.requestedFrom,
      params.requestedBy,
      params.requestType,
      params.description,
      params.priority,
      params.requiredBy,
      params.status,
      params.response,
      params.evidenceReferences,
      params.createdAt,
      params.completedAt,
    );
  }

  get requestedFrom(): string {
    return this._requestedFrom;
  }
  get requestedBy(): string {
    return this._requestedBy;
  }
  get requestType(): DataRequestType {
    return this._requestType;
  }
  get description(): string {
    return this._description;
  }
  get priority(): DataRequestPriority {
    return this._priority;
  }
  get requiredBy(): string | null {
    return this._requiredBy;
  }
  get status(): DataRequestStatus {
    return this._status;
  }
  get response(): string | null {
    return this._response;
  }
  get evidenceReferences(): string[] {
    return [...this._evidenceReferences];
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get completedAt(): string | null {
    return this._completedAt;
  }

  receive(response: string, evidenceReferences?: string[]): void {
    if (this._status === 'RECEIVED' || this._status === 'UNDER_REVIEW' || this._status === 'ACCEPTED' || this._status === 'REJECTED' || this._status === 'CANCELLED') {
      throw new Error(`Cannot receive data request in status ${this._status}`);
    }
    this._response = response;
    this._evidenceReferences = [...(evidenceReferences ?? [])];
    this._status = 'RECEIVED';
    this._completedAt = UtcInstant.now().toIso();
  }

  submitForReview(): void {
    if (this._status !== 'RECEIVED') {
      throw new Error('Only received requests can be submitted for review');
    }
    this._status = 'UNDER_REVIEW';
  }

  accept(): void {
    if (this._status !== 'UNDER_REVIEW') {
      throw new Error('Only requests under review can be accepted');
    }
    this._status = 'ACCEPTED';
    this._completedAt = UtcInstant.now().toIso();
  }

  reject(reason: string): void {
    if (this._status === 'ACCEPTED' || this._status === 'CANCELLED') {
      throw new Error('Cannot reject an accepted or cancelled request');
    }
    this._status = 'REJECTED';
    this._response = reason;
  }

  markOverdue(): void {
    if (this._status === 'REQUESTED' || this._status === 'PARTIALLY_RECEIVED') {
      this._status = 'OVERDUE';
    }
  }

  cancel(): void {
    if (this._status === 'ACCEPTED' || this._status === 'REJECTED') {
      throw new Error('Cannot cancel an accepted or rejected request');
    }
    this._status = 'CANCELLED';
  }
}
import { SubmissionId, TenantId, UtcInstant } from '@daos/shared-kernel';

export type SubmissionStatus = 'RECEIVED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'CONVERTED' | 'REJECTED';

export type SubmissionDocumentRef = {
  documentId: string;
  documentType: string;
  name: string;
};

export class Submission {
  private constructor(
    public readonly id: SubmissionId,
    public readonly tenantId: TenantId,
    public readonly caseId: string,
    private _version: number,
    private _source: string,
    private _channel: string,
    private _payload: Record<string, unknown>,
    private _documents: SubmissionDocumentRef[],
    private _status: SubmissionStatus,
    private _acknowledgedAt: string | null,
    private _rejectionReason: string | null,
    private _receivedAt: string,
    private _submittedBy: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId: string;
    source: string;
    channel: string;
    payload?: Record<string, unknown>;
    documents?: SubmissionDocumentRef[];
    submittedBy: string;
  }): Submission {
    return new Submission(
      SubmissionId.create(),
      params.tenantId,
      params.caseId,
      1,
      params.source,
      params.channel,
      params.payload ?? {},
      params.documents ?? [],
      'RECEIVED',
      null,
      null,
      UtcInstant.now().toIso(),
      params.submittedBy,
    );
  }

  static reconstruct(params: {
    id: SubmissionId;
    tenantId: TenantId;
    caseId: string;
    version: number;
    source: string;
    channel: string;
    payload: Record<string, unknown>;
    documents: SubmissionDocumentRef[];
    status: SubmissionStatus;
    acknowledgedAt: string | null;
    rejectionReason: string | null;
    receivedAt: string;
    submittedBy: string;
  }): Submission {
    return new Submission(
      params.id,
      params.tenantId,
      params.caseId,
      params.version,
      params.source,
      params.channel,
      params.payload,
      params.documents,
      params.status,
      params.acknowledgedAt,
      params.rejectionReason,
      params.receivedAt,
      params.submittedBy,
    );
  }

  get version(): number {
    return this._version;
  }
  get source(): string {
    return this._source;
  }
  get channel(): string {
    return this._channel;
  }
  get payload(): Record<string, unknown> {
    return this._payload;
  }
  get documents(): SubmissionDocumentRef[] {
    return [...this._documents];
  }
  get status(): SubmissionStatus {
    return this._status;
  }
  get acknowledgedAt(): string | null {
    return this._acknowledgedAt;
  }
  get rejectionReason(): string | null {
    return this._rejectionReason;
  }
  get receivedAt(): string {
    return this._receivedAt;
  }
  get submittedBy(): string {
    return this._submittedBy;
  }

  acknowledge(): void {
    if (this._status !== 'RECEIVED') {
      throw new Error('Only received submissions can be acknowledged');
    }
    this._status = 'ACKNOWLEDGED';
    this._acknowledgedAt = UtcInstant.now().toIso();
    this._version += 1;
  }

  convert(): void {
    if (this._status !== 'ACKNOWLEDGED') {
      throw new Error('Only acknowledged submissions can be converted');
    }
    this._status = 'CONVERTED';
    this._version += 1;
  }

  reject(reason: string): void {
    if (this._status === 'CONVERTED') {
      throw new Error('Cannot reject a converted submission');
    }
    this._status = 'REJECTED';
    this._rejectionReason = reason;
    this._version += 1;
  }
}

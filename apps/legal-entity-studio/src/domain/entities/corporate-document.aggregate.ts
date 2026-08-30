import {
  AggregateRoot,
  CorporateDocType,
  CorporateDocumentId,
  SignatureStatus,
  Signatory,
  TenantId,
} from '@daos/shared-kernel';

import { DocumentGenerated } from '../events/document-generated.event';

export class CorporateDocument extends AggregateRoot {
  private constructor(
    public readonly id: CorporateDocumentId,
    public readonly tenantId: TenantId,
    public readonly entityId: string,
    private _docType: CorporateDocType,
    private _fileRef: string,
    private _status: SignatureStatus,
    private _signatories: Signatory[],
    private _createdAt: string,
  ) {
    super();
  }

  static generate(params: {
    tenantId: TenantId;
    entityId: string;
    docType: CorporateDocType;
    fileRef: string;
  }): CorporateDocument {
    if (!params.fileRef.trim()) throw new Error('Document file reference is required');
    const document = new CorporateDocument(
      CorporateDocumentId.create(),
      params.tenantId,
      params.entityId,
      params.docType,
      params.fileRef.trim(),
      'pending',
      [],
      new Date().toISOString(),
    );
    document.raise(
      new DocumentGenerated(document.id.value, document.tenantId.value, document.entityId, document._docType, document._fileRef),
    );
    document.incrementVersion();
    return document;
  }

  static reconstruct(params: {
    id: CorporateDocumentId;
    tenantId: TenantId;
    entityId: string;
    docType: CorporateDocType;
    fileRef: string;
    status: SignatureStatus;
    signatories: Signatory[];
    createdAt: string;
    version: number;
  }): CorporateDocument {
    const document = new CorporateDocument(
      params.id,
      params.tenantId,
      params.entityId,
      params.docType,
      params.fileRef,
      params.status,
      params.signatories,
      params.createdAt,
    );
    document._version = params.version;
    return document;
  }

  get docType(): CorporateDocType {
    return this._docType;
  }

  get fileRef(): string {
    return this._fileRef;
  }

  get status(): SignatureStatus {
    return this._status;
  }

  get signatories(): Signatory[] {
    return [...this._signatories];
  }

  get createdAt(): string {
    return this._createdAt;
  }

  addSignatory(signatory: Signatory): void {
    this._signatories.push(signatory);
    this._recomputeStatus();
    this.incrementVersion();
  }

  markExecuted(): void {
    if (this._status === 'fullyExecuted') throw new Error('Corporate document is already fully executed');
    this._status = 'fullyExecuted';
    this._signatories = this._signatories.map((s) => ({
      ...s,
      signedAt: s.signedAt ?? new Date().toISOString(),
    }));
    this.incrementVersion();
  }

  private _recomputeStatus(): void {
    if (this._signatories.length > 0 && this._signatories.every((s) => s.signedAt !== null)) {
      this._status = 'fullyExecuted';
    } else if (this._signatories.some((s) => s.signedAt !== null)) {
      this._status = 'partiallyExecuted';
    } else {
      this._status = 'pending';
    }
  }
}
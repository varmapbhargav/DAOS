// Typed IDs for Document Management + Cap Table contexts
import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class DocumentId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DocumentId {
    return new DocumentId(value ?? randomUUID());
  }
}
export class DocumentVersionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DocumentVersionId {
    return new DocumentVersionId(value ?? randomUUID());
  }
}
export class CapTableId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CapTableId {
    return new CapTableId(value ?? randomUUID());
  }
}
export class ShareholderRecordId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ShareholderRecordId {
    return new ShareholderRecordId(value ?? randomUUID());
  }
}

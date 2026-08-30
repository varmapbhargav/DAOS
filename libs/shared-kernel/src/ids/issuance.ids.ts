// Typed IDs for Issuance context
import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class IssuanceId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): IssuanceId {
    return new IssuanceId(value ?? randomUUID());
  }
}
export class MintRequestId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): MintRequestId {
    return new MintRequestId(value ?? randomUUID());
  }
}

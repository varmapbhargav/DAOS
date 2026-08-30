// Typed IDs for Settlement & Clearing context
import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class SettlementInstructionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): SettlementInstructionId {
    return new SettlementInstructionId(value ?? randomUUID());
  }
}

export class CustodyAccountId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CustodyAccountId {
    return new CustodyAccountId(value ?? randomUUID());
  }
}

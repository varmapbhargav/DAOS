// Typed IDs for Distribution context
import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class SubscriptionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): SubscriptionId {
    return new SubscriptionId(value ?? randomUUID());
  }
}
export class AllocationId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): AllocationId {
    return new AllocationId(value ?? randomUUID());
  }
}
export class CapitalCallId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CapitalCallId {
    return new CapitalCallId(value ?? randomUUID());
  }
}
export class ClosingId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ClosingId {
    return new ClosingId(value ?? randomUUID());
  }
}
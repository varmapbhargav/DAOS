// Typed IDs for Marketplace context
import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class ListingId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ListingId {
    return new ListingId(value ?? randomUUID());
  }
}

export class OrderId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): OrderId {
    return new OrderId(value ?? randomUUID());
  }
}

export class TradeId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TradeId {
    return new TradeId(value ?? randomUUID());
  }
}

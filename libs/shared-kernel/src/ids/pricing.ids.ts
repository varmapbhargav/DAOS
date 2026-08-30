import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class PriceId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): PriceId {
    return new PriceId(value ?? randomUUID());
  }
}

export class ValuationModelId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ValuationModelId {
    return new ValuationModelId(value ?? randomUUID());
  }
}

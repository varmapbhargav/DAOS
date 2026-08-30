import { randomUUID } from 'node:crypto';

import { DomainId } from '@daos/shared-kernel';

export class WaterfallModelId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): WaterfallModelId {
    return new WaterfallModelId(value ?? randomUUID());
  }
}

export class DistributionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DistributionId {
    return new DistributionId(value ?? randomUUID());
  }
}

export class CorporateActionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CorporateActionId {
    return new CorporateActionId(value ?? randomUUID());
  }
}

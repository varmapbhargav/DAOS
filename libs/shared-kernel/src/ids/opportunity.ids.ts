// Typed IDs for Opportunity Engineering
import { randomUUID } from 'node:crypto';

import { DomainId } from '../ids/domain-id';

export class OpportunityId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): OpportunityId {
    return new OpportunityId(value ?? randomUUID());
  }
}
export class ScenarioModelId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ScenarioModelId {
    return new ScenarioModelId(value ?? randomUUID());
  }
}

// Typed IDs for Deal, Entity, Product contexts
import { randomUUID } from 'node:crypto';

import { DomainId } from '../ids/domain-id';

export class DealId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DealId {
    return new DealId(value ?? randomUUID());
  }
}
export class TermSheetId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TermSheetId {
    return new TermSheetId(value ?? randomUUID());
  }
}
export class TermSheetVersionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TermSheetVersionId {
    return new TermSheetVersionId(value ?? randomUUID());
  }
}
export class CapitalTrancheId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CapitalTrancheId {
    return new CapitalTrancheId(value ?? randomUUID());
  }
}
export class ClosingConditionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ClosingConditionId {
    return new ClosingConditionId(value ?? randomUUID());
  }
}
export class DealParticipantId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DealParticipantId {
    return new DealParticipantId(value ?? randomUUID());
  }
}
export class DealStatusHistoryId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DealStatusHistoryId {
    return new DealStatusHistoryId(value ?? randomUUID());
  }
}
export class WaterfallTierId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): WaterfallTierId {
    return new WaterfallTierId(value ?? randomUUID());
  }
}
export class WaterfallId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): WaterfallId {
    return new WaterfallId(value ?? randomUUID());
  }
}
export class DealEconomicsId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DealEconomicsId {
    return new DealEconomicsId(value ?? randomUUID());
  }
}
export class ScenarioId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ScenarioId {
    return new ScenarioId(value ?? randomUUID());
  }
}
export class OutboxEventId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): OutboxEventId {
    return new OutboxEventId(value ?? randomUUID());
  }
}
export class IdempotencyKeyId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): IdempotencyKeyId {
    return new IdempotencyKeyId(value ?? randomUUID());
  }
}
export class LegalEntityId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): LegalEntityId {
    return new LegalEntityId(value ?? randomUUID());
  }
}
export class CorporateDocumentId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CorporateDocumentId {
    return new CorporateDocumentId(value ?? randomUUID());
  }
}
export class InvestmentProductId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): InvestmentProductId {
    return new InvestmentProductId(value ?? randomUUID());
  }
}
export class ShareClassId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ShareClassId {
    return new ShareClassId(value ?? randomUUID());
  }
}

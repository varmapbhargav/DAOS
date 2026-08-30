// Typed IDs for Asset Origination
import { randomUUID } from 'node:crypto';

import { DomainId } from '../ids/domain-id';

export class AssetId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): AssetId {
    return new AssetId(value ?? randomUUID());
  }
}
export class DueDiligenceReportId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DueDiligenceReportId {
    return new DueDiligenceReportId(value ?? randomUUID());
  }
}
export class CashFlowModelId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CashFlowModelId {
    return new CashFlowModelId(value ?? randomUUID());
  }
}

// Typed IDs for Investor Management
import { randomUUID } from 'node:crypto';

import { DomainId } from '../ids/domain-id';

export class InvestorId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): InvestorId {
    return new InvestorId(value ?? randomUUID());
  }
}
export class KycProfileId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): KycProfileId {
    return new KycProfileId(value ?? randomUUID());
  }
}
export class BeneficialOwnerId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): BeneficialOwnerId {
    return new BeneficialOwnerId(value ?? randomUUID());
  }
}
export class WalletId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): WalletId {
    return new WalletId(value ?? randomUUID());
  }
}

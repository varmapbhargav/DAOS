import { randomUUID } from 'node:crypto';

export abstract class DomainId {
  protected constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(`${this.constructor.name} cannot be empty`);
    }
  }

  equals(other: DomainId): boolean {
    return other !== null && other.constructor === this.constructor && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class TenantId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TenantId {
    return new TenantId(value ?? randomUUID());
  }
}

export class UserId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): UserId {
    return new UserId(value ?? randomUUID());
  }
}

export class RoleId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): RoleId {
    return new RoleId(value ?? randomUUID());
  }
}

export class CorrelationId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CorrelationId {
    return new CorrelationId(value ?? randomUUID());
  }
}

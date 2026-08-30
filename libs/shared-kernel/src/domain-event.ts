import { randomUUID } from 'node:crypto';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly correlationId: string;
  public readonly causationId: string | null;
  public readonly schemaVersion: number;

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string | null,
    opts: { correlationId?: string; causationId?: string } = {},
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date().toISOString();
    this.correlationId = opts.correlationId ?? this.eventId;
    this.causationId = opts.causationId ?? null;
    this.schemaVersion = 1;
  }

  abstract get eventType(): string;
}

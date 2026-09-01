import { Logger } from '@nestjs/common';

import { AggregateRoot } from '../aggregate-root';
import { NotFoundError } from '../errors';
import { DomainEvent } from '../domain-event';
import { EventStore, StoredEvent } from '../ports/event-store.port';
import { SnapshotStore } from '../ports/snapshot-store.port';

export abstract class EventSourcedRepository<A extends AggregateRoot> {
  protected readonly logger = new Logger(this.constructor.name);

  private readonly SNAPSHOT_INTERVAL = 50;

  constructor(
    protected readonly eventStore: EventStore,
    protected readonly snapshotStore?: SnapshotStore,
  ) {}

  async save(aggregate: A): Promise<void> {
    const events = aggregate.getUnpublishedEvents();
    if (events.length === 0) return;

    const tenantId = this.extractTenantId(aggregate);
    const aggregateId = this.extractAggregateId(aggregate);
    const expectedVersion = aggregate.version - events.length;

    await this.eventStore.append(events, expectedVersion);

    const shouldSnapshot =
      this.snapshotStore &&
      aggregate.version % this.SNAPSHOT_INTERVAL === 0;

    if (shouldSnapshot) {
      await this.snapshotStore!.save({
        aggregateId,
        tenantId,
        state: this.serializeAggregate(aggregate),
        version: aggregate.version,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async load(aggregateId: string, tenantId: string): Promise<A | null> {
    let aggregate: A | null = null;
    let fromVersion = 0;

    if (this.snapshotStore) {
      const snapshot = await this.snapshotStore.getLatest(aggregateId, tenantId);
      if (snapshot) {
        aggregate = this.hydrateFromSnapshot(snapshot.state);
        aggregate['_version'] = snapshot.version;
        fromVersion = snapshot.version;
        this.logger.debug(
          `Loaded snapshot for ${aggregateId} at version ${snapshot.version}`,
        );
      }
    }

    const events = await this.eventStore.getEvents(aggregateId, tenantId, fromVersion);

    if (!aggregate && events.length === 0) {
      return null;
    }

    if (!aggregate) {
      aggregate = this.createEmpty();
    }

    for (const event of events) {
      this.applyEvent(aggregate, event);
    }

    return aggregate;
  }

  async loadOrThrow(aggregateId: string, tenantId: string): Promise<A> {
    const aggregate = await this.load(aggregateId, tenantId);
    if (!aggregate) {
      throw new NotFoundError(`${this.aggregateName()} not found: ${aggregateId}`);
    }
    return aggregate;
  }

  protected applyEvent(aggregate: A, event: StoredEvent): void {
    aggregate.apply(event);
  }

  protected abstract extractAggregateId(aggregate: A): string;
  protected abstract extractTenantId(aggregate: A): string;
  protected abstract aggregateName(): string;
  protected abstract createEmpty(): A;
  protected abstract serializeAggregate(aggregate: A): Record<string, unknown>;
  protected abstract hydrateFromSnapshot(state: Record<string, unknown>): A;
}

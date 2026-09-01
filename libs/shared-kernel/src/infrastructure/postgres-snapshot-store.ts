import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SnapshotData, SnapshotStore } from '../ports/snapshot-store.port';
import { SnapshotEntity } from './snapshot-entity';

@Injectable()
export class PostgresSnapshotStore implements SnapshotStore {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(snapshot: SnapshotData): Promise<void> {
    const row = new SnapshotEntity();
    row.aggregateId = snapshot.aggregateId;
    row.tenantId = snapshot.tenantId;
    row.state = snapshot.state;
    row.version = snapshot.version;
    row.createdAt = new Date(snapshot.createdAt);

    await this.ds
      .getRepository(SnapshotEntity)
      .createQueryBuilder()
      .insert()
      .into(SnapshotEntity)
      .values(row)
      .orUpdate(['state', 'version', 'created_at'], ['aggregate_id', 'tenant_id'])
      .execute();
  }

  async getLatest(aggregateId: string, tenantId: string): Promise<SnapshotData | null> {
    const row = await this.ds
      .getRepository(SnapshotEntity)
      .createQueryBuilder('s')
      .where('s.aggregate_id = :aggregateId AND s.tenant_id = :tenantId', { aggregateId, tenantId })
      .orderBy('s.version', 'DESC')
      .getOne();

    if (!row) return null;

    return {
      aggregateId: row.aggregateId,
      tenantId: row.tenantId,
      state: row.state as Record<string, unknown>,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

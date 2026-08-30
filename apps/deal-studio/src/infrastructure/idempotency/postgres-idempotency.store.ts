import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { IdempotencyRecordOrmEntity } from '../persistence/entities/idempotency-record.orm-entity';

export type IdempotencyStatus = 'IN_FLIGHT' | 'COMPLETED' | 'FAILED';

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  status: IdempotencyStatus;
  responseReference: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface IdempotencyStore {
  /** Returns existing record if key already processed; null if novel. */
  checkOrLock(key: string, requestHash: string): Promise<IdempotencyRecord | null>;
  /** Mark the operation as successfully completed. */
  complete(key: string, responseReference: string): Promise<void>;
  /** Mark the operation as failed so callers can retry. */
  fail(key: string, error: string): Promise<void>;
}

@Injectable()
export class PostgresIdempotencyStore implements IdempotencyStore {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async checkOrLock(key: string, requestHash: string): Promise<IdempotencyRecord | null> {
    const repo = this.ds.getRepository(IdempotencyRecordOrmEntity);

    // Atomic upsert — insert only if key absent
    await repo
      .createQueryBuilder()
      .insert()
      .into(IdempotencyRecordOrmEntity)
      .values({
        key,
        requestHash,
        status: 'IN_FLIGHT',
        responseReference: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        lastError: null,
      })
      .orIgnore()
      .execute();

    const record = await repo.findOne({ where: { key } });
    if (!record) return null;

    // Key was already there — return existing record so caller can short-circuit
    if (record.status === 'COMPLETED') {
      return {
        key: record.key,
        requestHash: record.requestHash,
        status: 'COMPLETED',
        responseReference: record.responseReference,
        createdAt: record.createdAt,
        completedAt: record.completedAt,
      };
    }

    // IN_FLIGHT means another request is processing — caller decides (retry / wait)
    if (record.requestHash !== requestHash) {
      // Different payload for same key — conflict
      throw new Error(`Idempotency key ${key} was already used with a different request payload`);
    }

    return null; // novel request — proceed
  }

  async complete(key: string, responseReference: string): Promise<void> {
    await this.ds.getRepository(IdempotencyRecordOrmEntity).update(
      { key },
      { status: 'COMPLETED', responseReference, completedAt: new Date().toISOString() },
    );
  }

  async fail(key: string, error: string): Promise<void> {
    await this.ds.getRepository(IdempotencyRecordOrmEntity).update(
      { key },
      { status: 'FAILED', lastError: error, completedAt: new Date().toISOString() },
    );
  }
}

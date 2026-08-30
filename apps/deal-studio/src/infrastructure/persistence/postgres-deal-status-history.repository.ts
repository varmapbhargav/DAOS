import { DealStatusHistoryId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DealStatusHistory } from '../../domain/entities/deal-status-history.entity';
import { DealStatusHistoryRepository } from '../../domain/repositories/deal-status-history.repository';
import { DealStatusHistoryOrmEntity } from './entities/deal-status-history.orm-entity';
import { DealStatus } from '@daos/shared-kernel';

@Injectable()
export class PostgresDealStatusHistoryRepository implements DealStatusHistoryRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async saveAll(entries: DealStatusHistory[]): Promise<void> {
    if (entries.length === 0) return;
    const rows = entries.map((h) => {
      const e = new DealStatusHistoryOrmEntity();
      e.id = h.id.value;
      e.dealId = h.dealId;
      e.tenantId = h.tenantId;
      e.previousStatus = h.previousStatus;
      e.newStatus = h.newStatus;
      e.reason = h.reason;
      e.changedBy = h.changedBy;
      e.changedAt = h.changedAt;
      e.metadata = h.metadata;
      return e;
    });

    const tenantId = entries[0].tenantId;
    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId}'`);
      await mgr
        .getRepository(DealStatusHistoryOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DealStatusHistoryOrmEntity)
        .values(rows)
        .orIgnore()
        .execute();
    });
  }

  async findByDealId(tenantId: TenantId, dealId: string): Promise<DealStatusHistory[]> {
    const entities = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(DealStatusHistoryOrmEntity)
        .find({
          where: { tenantId: tenantId.value, dealId },
          order: { changedAt: 'ASC' },
        });
    });
    return entities.map((e) =>
      DealStatusHistory.reconstruct({
        id: DealStatusHistoryId.create(e.id),
        dealId: e.dealId,
        tenantId: e.tenantId,
        previousStatus: e.previousStatus as DealStatus | null,
        newStatus: e.newStatus as DealStatus,
        reason: e.reason,
        changedBy: e.changedBy,
        changedAt: e.changedAt,
        metadata: e.metadata as Record<string, unknown>,
      }),
    );
  }
}

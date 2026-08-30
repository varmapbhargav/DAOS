import { ClosingConditionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ClosingCondition } from '../../domain/aggregates/closing-condition.aggregate';
import { ClosingConditionRepository } from '../../domain/repositories/closing-condition.repository';
import { ClosingConditionOrmEntity } from './entities/closing-condition.orm-entity';
import { ClosingConditionMapper } from './mappers/closing-condition.mapper';

@Injectable()
export class PostgresClosingConditionRepository implements ClosingConditionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(cc: ClosingCondition): Promise<void> {
    const orm = ClosingConditionMapper.toOrm(cc);
    orm.updatedAt = new Date();
    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${cc.tenantId.value}'`);
      await mgr
        .getRepository(ClosingConditionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ClosingConditionOrmEntity)
        .values(orm)
        .orUpdate(
          ['category', 'condition_type', 'description', 'responsible_party',
           'due_date', 'status', 'evidence', 'verified_by', 'verified_at',
           'version', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ClosingConditionId): Promise<ClosingCondition | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(ClosingConditionOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? ClosingConditionMapper.toDomain(e) : null;
  }

  async findByDealId(tenantId: TenantId, dealId: string): Promise<ClosingCondition[]> {
    const entities = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(ClosingConditionOrmEntity)
        .find({ where: { tenantId: tenantId.value, dealId } });
    });
    return entities.map(ClosingConditionMapper.toDomain);
  }
}

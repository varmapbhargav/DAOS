import { CompletenessId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CompletenessResult } from '../../domain/entities/completeness-result.entity';
import { CompletenessResultRepository } from '../../domain/repositories/completeness-result.repository';
import { CompletenessResultOrmEntity } from './entities/completeness-result.orm-entity';
import { CompletenessResultMapper } from './mappers/completeness-result.mapper';

@Injectable()
export class PostgresCompletenessResultRepository implements CompletenessResultRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(result: CompletenessResult): Promise<void> {
    const orm = CompletenessResultMapper.toOrm(result);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${result.tenantId.value}'`);
      await manager
        .getRepository(CompletenessResultOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CompletenessResultOrmEntity)
        .values(orm as unknown as Record<string, unknown>)
        .orUpdate(
          ['case_id', 'breakdown', 'calculated_by', 'calculated_at', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CompletenessId): Promise<CompletenessResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CompletenessResultOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? CompletenessResultMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<CompletenessResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CompletenessResultOrmEntity).findOne({ where: { tenantId: tenantId.value, caseId } });
    });
    return e ? CompletenessResultMapper.toDomain(e) : null;
  }
}
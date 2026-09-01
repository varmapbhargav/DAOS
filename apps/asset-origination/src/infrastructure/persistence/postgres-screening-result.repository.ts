import { ScreeningId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ScreeningResult } from '../../domain/entities/screening-result.entity';
import { ScreeningResultRepository } from '../../domain/repositories/screening-result.repository';
import { ScreeningResultOrmEntity } from './entities/screening-result.orm-entity';
import { ScreeningResultMapper } from './mappers/screening-result.mapper';

@Injectable()
export class PostgresScreeningResultRepository implements ScreeningResultRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(screening: ScreeningResult): Promise<void> {
    const orm = ScreeningResultMapper.toOrm(screening);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${screening.tenantId.value}'`);
      await manager
        .getRepository(ScreeningResultOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ScreeningResultOrmEntity)
        .values(orm as unknown as Record<string, unknown>)
        .orUpdate(
          [
            'case_id',
            'decision',
            'score',
            'max_score',
            'criteria',
            'comments',
            'reviewer',
            'reviewed_at',
            'override_by',
            'override_reason',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ScreeningId): Promise<ScreeningResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ScreeningResultOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? ScreeningResultMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<ScreeningResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(ScreeningResultOrmEntity).findOne({ where: { tenantId: tenantId.value, caseId } });
    });
    return e ? ScreeningResultMapper.toDomain(e) : null;
  }
}

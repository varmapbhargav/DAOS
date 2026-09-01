import { QualificationId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { QualificationResult } from '../../domain/entities/qualification-result.entity';
import { QualificationResultRepository } from '../../domain/repositories/qualification-result.repository';
import { QualificationResultOrmEntity } from './entities/qualification-result.orm-entity';
import { QualificationResultMapper } from './mappers/qualification-result.mapper';

@Injectable()
export class PostgresQualificationResultRepository implements QualificationResultRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(qualification: QualificationResult): Promise<void> {
    const orm = QualificationResultMapper.toOrm(qualification);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${qualification.tenantId.value}'`);
      await manager
        .getRepository(QualificationResultOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(QualificationResultOrmEntity)
        .values(orm as unknown as Record<string, unknown>)
        .orUpdate(
          [
            'case_id',
            'decision',
            'score',
            'blockers',
            'missing_evidence',
            'explanation',
            'qualified_by',
            'qualified_at',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: QualificationId): Promise<QualificationResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(QualificationResultOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? QualificationResultMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<QualificationResult | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(QualificationResultOrmEntity).findOne({ where: { tenantId: tenantId.value, caseId } });
    });
    return e ? QualificationResultMapper.toDomain(e) : null;
  }
}

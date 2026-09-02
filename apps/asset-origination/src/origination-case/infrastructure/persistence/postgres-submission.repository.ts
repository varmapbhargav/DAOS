import { SubmissionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Submission } from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../domain/repositories/submission.repository';
import { SubmissionOrmEntity } from './entities/submission.orm-entity';
import { SubmissionMapper } from './mappers/submission.mapper';

@Injectable()
export class PostgresSubmissionRepository implements SubmissionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(submission: Submission): Promise<void> {
    const orm = SubmissionMapper.toOrm(submission);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${submission.tenantId.value}'`);
      await manager
        .getRepository(SubmissionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(SubmissionOrmEntity)
        .values(orm as any)
        .orUpdate(
          ['version', 'source', 'channel', 'payload', 'documents', 'status', 'acknowledged_at', 'rejection_reason', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: SubmissionId): Promise<Submission | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubmissionOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? SubmissionMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Submission[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SubmissionOrmEntity).find({ where: { tenantId: tenantId.value, caseId } });
    });
    return entities.map(SubmissionMapper.toDomain);
  }
}

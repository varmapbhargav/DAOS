import { BlockerId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Blocker } from '../../domain/entities/blocker.entity';
import { BlockerRepository } from '../../domain/repositories/blocker.repository';
import { BlockerOrmEntity } from './entities/blocker.orm-entity';
import { BlockerMapper } from './mappers/blocker.mapper';

@Injectable()
export class PostgresBlockerRepository implements BlockerRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(blocker: Blocker): Promise<void> {
    const orm = BlockerMapper.toOrm(blocker);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${blocker.tenantId.value}'`);
      await manager
        .getRepository(BlockerOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(BlockerOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'case_id',
            'severity',
            'category',
            'description',
            'owner',
            'due_date',
            'resolution_action',
            'evidence_references',
            'resolution_status',
            'resolved_by',
            'resolved_at',
            'resolved_reason',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: BlockerId): Promise<Blocker | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(BlockerOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? BlockerMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Blocker[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(BlockerOrmEntity).find({ where: { tenantId: tenantId.value, caseId } });
    });
    return entities.map(BlockerMapper.toDomain);
  }
}
import { OriginationCaseId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OriginationCase } from '../../domain/aggregates/origination-case.aggregate';
import { OriginationCaseRepository } from '../../domain/repositories/origination-case.repository';
import { OriginationCaseOrmEntity } from './entities/origination-case.orm-entity';
import { OriginationCaseMapper } from './mappers/origination-case.mapper';

@Injectable()
export class PostgresOriginationCaseRepository implements OriginationCaseRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(origin: OriginationCase): Promise<void> {
    const orm = OriginationCaseMapper.toOrm(origin);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${origin.tenantId.value}'`);
      await manager
        .getRepository(OriginationCaseOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(OriginationCaseOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'case_number',
            'case_name',
            'submission_type',
            'submission_channel',
            'source_id',
            'submitted_by',
            'relationship_manager_id',
            'assigned_team_id',
            'assigned_analyst_id',
            'asset_class',
            'asset_subclass',
            'jurisdictions',
            'indicative_value_minor_units',
            'currency',
            'priority',
            'status',
            'next_action',
            'next_action_due',
            'duplicate_check_status',
            'initial_screening_status',
            'submitted_at',
            'received_at',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: OriginationCaseId): Promise<OriginationCase | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(OriginationCaseOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? OriginationCaseMapper.toDomain(e) : null;
  }

  async findByCaseNumber(tenantId: TenantId, caseNumber: string): Promise<OriginationCase | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(OriginationCaseOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, caseNumber } });
    });
    return e ? OriginationCaseMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<OriginationCase[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(OriginationCaseOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(OriginationCaseMapper.toDomain);
  }
}

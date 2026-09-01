import { DataRequestId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DataRequest } from '../../domain/entities/data-request.entity';
import { DataRequestRepository } from '../../domain/repositories/data-request.repository';
import { DataRequestOrmEntity } from './entities/data-request.orm-entity';
import { DataRequestMapper } from './mappers/data-request.mapper';

@Injectable()
export class PostgresDataRequestRepository implements DataRequestRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(request: DataRequest): Promise<void> {
    const orm = DataRequestMapper.toOrm(request);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${request.tenantId.value}'`);
      await manager
        .getRepository(DataRequestOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DataRequestOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'requested_from',
            'requested_by',
            'request_type',
            'description',
            'priority',
            'required_by',
            'status',
            'response',
            'evidence_references',
            'completed_at',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DataRequestId): Promise<DataRequest | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DataRequestOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? DataRequestMapper.toDomain(e) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<DataRequest[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(DataRequestOrmEntity).find({ where: { tenantId: tenantId.value, caseId } });
    });
    return entities.map(DataRequestMapper.toDomain);
  }
}

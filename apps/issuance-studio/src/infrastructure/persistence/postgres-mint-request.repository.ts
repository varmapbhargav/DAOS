import { MintRequestId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { MintRequest } from '../../domain/entities/mint-request.entity';
import { MintRequestRepository } from '../../domain/repositories/issuance.repository';
import { MintRequestOrmEntity } from './entities/mint-request.orm-entity';
import { MintRequestMapper } from './mappers/mint-request.mapper';

@Injectable()
export class PostgresMintRequestRepository implements MintRequestRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(request: MintRequest): Promise<void> {
    const orm = MintRequestMapper.toOrm(request);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${request.tenantId.value}'`);
      await manager
        .getRepository(MintRequestOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(MintRequestOrmEntity)
        .values(orm)
        .orUpdate(
          ['amount_minor_units', 'to_address', 'status', 'tx_hash', 'confirmed_at', 'version', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: MintRequestId): Promise<MintRequest | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(MintRequestOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? MintRequestMapper.toDomain(e) : null;
  }

  async findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<MintRequest[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(MintRequestOrmEntity).find({ where: { tenantId: tenantId.value, issuanceId } });
    });
    return entities.map(MintRequestMapper.toDomain);
  }
}
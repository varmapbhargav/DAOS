import { ClaimId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetClaim } from '../../domain/entities/asset-claim.entity';
import { AssetClaimRepository } from '../../domain/repositories/asset-claim.repository';
import { AssetClaimOrmEntity } from './entities/asset-claim.orm-entity';
import { AssetClaimMapper } from './mappers/asset-claim.mapper';

@Injectable()
export class PostgresAssetClaimRepository implements AssetClaimRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(claim: AssetClaim): Promise<void> {
    const orm = AssetClaimMapper.toOrm(claim);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${claim.tenantId.value}'`);
      await manager
        .getRepository(AssetClaimOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetClaimOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'claim_statement',
            'claim_type',
            'claim_owner',
            'materiality',
            'status',
            'verification_method',
            'evidence_references',
            'confidence',
            'reviewer',
            'verified_at',
            'rejection_reason',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ClaimId): Promise<AssetClaim | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetClaimOrmEntity).findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetClaimMapper.toDomain(e) : null;
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetClaim[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetClaimOrmEntity).find({ where: { tenantId: tenantId.value, assetId } });
    });
    return entities.map(AssetClaimMapper.toDomain);
  }
}

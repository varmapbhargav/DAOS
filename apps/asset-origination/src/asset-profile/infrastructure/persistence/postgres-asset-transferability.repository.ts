import { TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AssetTransferability } from '../../domain/entities/asset-transferability.entity';
import { AssetTransferabilityRepository } from '../../domain/repositories/asset-transferability.repository';
import { AssetTransferabilityOrmEntity } from './entities/asset-transferability.orm-entity';
import { AssetTransferabilityMapper } from './mappers/asset-transferability.mapper';

@Injectable()
export class PostgresAssetTransferabilityRepository implements AssetTransferabilityRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(transferability: AssetTransferability): Promise<void> {
    const orm = AssetTransferabilityMapper.toOrm(transferability);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${transferability.tenantId.value}'`);
      await manager
        .getRepository(AssetTransferabilityOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetTransferabilityOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'transferable',
            'assignable',
            'fractionalizable',
            'tokenizable',
            'beneficial_interest_transferable',
            'issuer_consent_required',
            'owner_consent_required',
            'regulator_approval_required',
            'geographic_restrictions',
            'investor_restrictions',
            'secondary_transfer_restrictions',
            'lockup_days',
            'pre_emption_rights',
            'transfer_fees',
            'transfer_documentation',
            'legal_opinion_required',
            'status',
            'evidence_references',
            'reviewer',
            'assessment_date',
            'review_decision',
            'notes',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<AssetTransferability | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(AssetTransferabilityOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, assetId } });
    });
    return e ? AssetTransferabilityMapper.toDomain(e) : null;
  }

  async delete(tenantId: TenantId, assetId: string): Promise<void> {
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      await manager.getRepository(AssetTransferabilityOrmEntity).delete({ tenantId: tenantId.value, assetId });
    });
  }
}

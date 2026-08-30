import { AssetId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Asset } from '../../domain/aggregates/asset.aggregate';
import { AssetRepository } from '../../domain/repositories/asset.repository';
import { AssetOrmEntity } from './entities/asset.orm-entity';
import { AssetMapper } from './mappers/asset.mapper';
import { SponsorReferenceOrmEntity } from './entities/sponsor-reference.orm-entity';

@Injectable()
export class PostgresAssetRepository implements AssetRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(asset: Asset): Promise<void> {
    const orm = AssetMapper.toOrm(asset);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${asset.tenantId.value}'`);
      await manager
        .getRepository(AssetOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(AssetOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'name',
            'asset_class',
            'sponsor_id',
            'status',
            'jurisdictions',
            'purchase_price_amount',
            'purchase_price_currency',
            'collateral',
            'provenance',
            'valuation_fair_value',
            'valuation_currency',
            'valuation_methodology',
            'valuation_valued_at',
            'due_diligence_rating',
            'approved_by',
            'rejection_reason',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
      // Also save sponsor reference if present
      if (asset.sponsorReference) {
        const refOrm = new SponsorReferenceOrmEntity();
        refOrm.id = asset.sponsorReference.id;
        refOrm.entityId = asset.id; // Using asset id as entityId for now
        refOrm.tenantId = asset.tenantId.value;
        refOrm.name = asset.sponsorReference.name;
        refOrm.jurisdiction = asset.sponsorReference.jurisdiction;
        refOrm.relationshipStatus = asset.sponsorReference.relationshipStatus;
        refOrm.riskRating = asset.sponsorReference.riskRating;
        refOrm.verificationStatus = asset.sponsorReference.verificationStatus;

        await manager
          .getRepository(SponsorReferenceOrmEntity)
          .createQueryBuilder()
          .insert()
          .into(SponsorReferenceOrmEntity)
          .values(refOrm)
          .orUpdate(
            ['name', 'jurisdiction', 'relationship_status', 'risk_rating', 'verification_status', 'updated_at'],
            ['entity_id', 'tenant_id'],
          )
          .execute();
      }
    });
  }

  async findById(tenantId: TenantId, id: AssetId): Promise<Asset | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(AssetOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? AssetMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Asset[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(AssetOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(AssetMapper.toDomain);
  }
}

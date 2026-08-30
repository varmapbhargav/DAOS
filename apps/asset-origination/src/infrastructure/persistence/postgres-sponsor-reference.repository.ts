import { EntityId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SponsorReference } from '../../domain/entities/sponsor-reference.entity';
import { SponsorReferenceOrmEntity } from '../entities/sponsor-reference.orm-entity';
import { SponsorReferenceRepository } from '../../domain/repositories/sponsor-reference.repository';
import { SponsorReference as SponsorRefDomain } from '../../domain/entities/sponsor-reference.entity';

@Injectable()
export class PostgresSponsorReferenceRepository implements SponsorReferenceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(sponsorRef: SponsorReference): Promise<void> {
    const orm = new SponsorReferenceOrmEntity();
    orm.id = sponsorRef.id;
    orm.entityId = sponsorRef.entityId;
    orm.tenantId = sponsorRef.tenantId;
    orm.name = sponsorRef.name;
    orm.jurisdiction = sponsorRef.jurisdiction;
    orm.relationshipStatus = sponsorRef.relationshipStatus;
    orm.riskRating = sponsorRef.riskRating;
    orm.verificationStatus = sponsorRef.verificationStatus;

    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${sponsorRef.tenantId}'`);
      await manager
        .getRepository(SponsorReferenceOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(SponsorReferenceOrmEntity)
        .values(orm)
        .orUpdate(
          ['name', 'jurisdiction', 'relationship_status', 'risk_rating', 'verification_status', 'updated_at'],
          ['entity_id', 'tenant_id'],
        )
        .execute();
    });
  }

  async findByEntityId(tenantId: TenantId, entityId: EntityId): Promise<SponsorReference | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(SponsorReferenceOrmEntity)
        .findOne({ where: { entityId: entityId.value, tenantId: tenantId.value } });
    });
    if (!e) return null;
    return {
      id: e.id,
      entityId: e.entityId,
      tenantId: e.tenantId,
      name: e.name,
      jurisdiction: e.jurisdiction,
      relationshipStatus: e.relationshipStatus,
      riskRating: e.riskRating,
      verificationStatus: e.verificationStatus,
    };
  }

  async findByTenantId(tenantId: TenantId): Promise<SponsorReference[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(SponsorReferenceOrmEntity)
        .find({ where: { tenantId: tenantId.value }, order: { createdAt: 'DESC' } });
    });
    return entities.map((e) => ({
      id: e.id,
      entityId: e.entityId,
      tenantId: e.tenantId,
      name: e.name,
      jurisdiction: e.jurisdiction,
      relationshipStatus: e.relationshipStatus,
      riskRating: e.riskRating,
      verificationStatus: e.verificationStatus,
    }));
  }
}
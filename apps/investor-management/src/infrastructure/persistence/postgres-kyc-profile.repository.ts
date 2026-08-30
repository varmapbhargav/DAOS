import { KycProfileId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { KycProfile } from '../../domain/entities/kyc-profile.entity';
import { KycProfileRepository } from '../../domain/repositories/kyc-profile.repository';
import { KycProfileOrmEntity } from './entities/kyc-profile.orm-entity';
import { KycProfileMapper } from './mappers/kyc-profile.mapper';

@Injectable()
export class PostgresKycProfileRepository implements KycProfileRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(profile: KycProfile): Promise<void> {
    const orm = KycProfileMapper.toOrm(profile);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${profile.tenantId.value}'`);
      await manager
        .getRepository(KycProfileOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(KycProfileOrmEntity)
        .values(orm)
        .orUpdate(['status', 'provider_ref', 'documents', 'submitted_at', 'reviewed_at', 'report', 'updated_at'], ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: KycProfileId): Promise<KycProfile | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(KycProfileOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? KycProfileMapper.toDomain(e) : null;
  }

  async findByInvestorId(tenantId: TenantId, investorId: string): Promise<KycProfile | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(KycProfileOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, investorId } });
    });
    return e ? KycProfileMapper.toDomain(e) : null;
  }
}

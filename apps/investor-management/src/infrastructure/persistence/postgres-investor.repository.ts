import { Email, InvestorId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Investor } from '../../domain/aggregates/investor.aggregate';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { InvestorOrmEntity } from './entities/investor.orm-entity';
import { InvestorMapper } from './mappers/investor.mapper';

@Injectable()
export class PostgresInvestorRepository implements InvestorRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(investor: Investor): Promise<void> {
    const orm = InvestorMapper.toOrm(investor);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${investor.tenantId.value}'`);
      await manager
        .getRepository(InvestorOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(InvestorOrmEntity)
        .values(orm)
        .orUpdate(
          ['user_id', 'email', 'status', 'profile', 'accreditation_level', 'accreditation_status', 'accreditation_expires_at', 'kyc_status', 'risk_profile', 'wallet_addresses', 'wallet_ids', 'version', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: InvestorId): Promise<Investor | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestorOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? InvestorMapper.toDomain(e) : null;
  }

  async findByEmail(tenantId: TenantId, email: Email): Promise<Investor | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestorOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, email: email.value } });
    });
    return e ? InvestorMapper.toDomain(e) : null;
  }

  async findByUserId(tenantId: TenantId, userId: string): Promise<Investor | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestorOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, userId } });
    });
    return e ? InvestorMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<Investor[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(InvestorOrmEntity)
        .find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(InvestorMapper.toDomain);
  }
}

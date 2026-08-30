import { TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Tenant } from '../../domain/aggregates/tenant.aggregate';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantOrmEntity } from './entities/tenant.orm-entity';
import { TenantMapper } from './mappers/tenant.mapper';

@Injectable()
export class PostgresTenantRepository implements TenantRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(tenant: Tenant): Promise<void> {
    const orm = TenantMapper.toOrm(tenant);
    await this.ds
      .getRepository(TenantOrmEntity)
      .createQueryBuilder()
      .insert()
      .into(TenantOrmEntity)
      .values(orm)
      .orUpdate(['name', 'status', 'white_label', 'version', 'updated_at'], ['id'])
      .setParameter('updated_at', new Date())
      .execute();
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    const e = await this.ds
      .getRepository(TenantOrmEntity)
      .findOne({ where: { id: id.value } });
    return e ? TenantMapper.toDomain(e) : null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    const e = await this.ds
      .getRepository(TenantOrmEntity)
      .findOne({ where: { subdomain } });
    return e ? TenantMapper.toDomain(e) : null;
  }
}

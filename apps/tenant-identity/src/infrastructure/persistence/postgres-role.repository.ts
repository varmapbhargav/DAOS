import { RoleId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Role } from '../../domain/entities/role.entity';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { RoleOrmEntity } from './entities/role.orm-entity';
import { RoleMapper } from './mappers/role.mapper';

@Injectable()
export class PostgresRoleRepository implements RoleRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private get repo() {
    return this.ds.getRepository(RoleOrmEntity);
  }

  async save(role: Role): Promise<void> {
    const orm = RoleMapper.toOrm(role);
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(RoleOrmEntity)
      .values(orm)
      .orUpdate(['name', 'permissions', 'version', 'updated_at'], ['id'])
      .execute();
  }

  async saveAll(roles: Role[]): Promise<void> {
    const orms = roles.map(RoleMapper.toOrm);
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(RoleOrmEntity)
      .values(orms)
      .orUpdate(['name', 'permissions', 'version', 'updated_at'], ['id'])
      .execute();
  }

  async findAll(tenantId: TenantId): Promise<Role[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(RoleOrmEntity).find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(RoleMapper.toDomain);
  }

  async findById(tenantId: TenantId, id: RoleId): Promise<Role | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(RoleOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? RoleMapper.toDomain(e) : null;
  }

  async findByName(tenantId: TenantId, name: string): Promise<Role | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(RoleOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, name } });
    });
    return e ? RoleMapper.toDomain(e) : null;
  }
}

import { Email, RoleId, TenantId, UserId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../../domain/aggregates/user.aggregate';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserOrmEntity } from './entities/user.orm-entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(user: User): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${user.tenantId.value}'`);
      await manager
        .getRepository(UserOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(UserOrmEntity)
        .values(orm)
        .orUpdate(['email', 'status', 'password_hash', 'role_ids', 'version', 'updated_at'], ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: UserId): Promise<User | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(UserOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? UserMapper.toDomain(e) : null;
  }

  async findByEmail(tenantId: TenantId, email: Email): Promise<User | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(UserOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, email: email.value } });
    });
    return e ? UserMapper.toDomain(e) : null;
  }

  async findAll(tenantId: TenantId): Promise<User[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(UserOrmEntity)
        .find({ where: { tenantId: tenantId.value } });
    });
    return entities.map(UserMapper.toDomain);
  }

  async countActiveWithRole(tenantId: TenantId, roleId: RoleId): Promise<number> {
    const result = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(UserOrmEntity)
        .createQueryBuilder('u')
        .where('u.tenant_id = :tid', { tid: tenantId.value })
        .andWhere('u.status = :status', { status: 'active' })
        .andWhere(`u.role_ids @> :rid::jsonb`, { rid: JSON.stringify([roleId.value]) })
        .getCount();
    });
    return result;
  }
}

import { CustodyAccountId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CustodyAccount } from '../../domain/aggregates/custody-account.aggregate';
import { CustodyAccountRepository } from '../../domain/repositories/custody-account.repository';
import { CustodyAccountOrmEntity } from './entities/settlement.orm-entities';
import { custodyAccountFromOrm, custodyAccountToOrm } from './mappers/settlement.mapper';

const UPSERT_COLUMNS = ['investor_id', 'custody_type', 'custodian_ref', 'holdings', 'version', 'updated_at'];

@Injectable()
export class PostgresCustodyAccountRepository implements CustodyAccountRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(account: CustodyAccount): Promise<void> {
    const orm = custodyAccountToOrm(account);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${account.tenantId.value}'`);
      await manager
        .getRepository(CustodyAccountOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(CustodyAccountOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: CustodyAccountId): Promise<CustodyAccount | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CustodyAccountOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? custodyAccountFromOrm(e) : null;
  }

  async findByInvestorId(tenantId: TenantId, investorId: string): Promise<CustodyAccount | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(CustodyAccountOrmEntity).findOne({
        where: { tenantId: tenantId.value, investorId },
      });
    });
    return e ? custodyAccountFromOrm(e) : null;
  }
}

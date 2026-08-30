import { TenantId, TermSheetId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TermSheet } from '../../domain/aggregates/term-sheet.aggregate';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import { TermSheetOrmEntity } from './entities/term-sheet.orm-entity';
import { TermSheetMapper } from './mappers/term-sheet.mapper';

@Injectable()
export class PostgresTermSheetRepository implements TermSheetRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(ts: TermSheet): Promise<void> {
    const orm = TermSheetMapper.toOrm(ts);
    orm.updatedAt = new Date();
    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${ts.tenantId.value}'`);
      await mgr
        .getRepository(TermSheetOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(TermSheetOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'status', 'current_version_number', 'versions',
            'economic_rights', 'governance_terms', 'vesting_schedule',
            'transfer_restrictions', 'closing_condition_ids',
            'finalized_at', 'finalized_by', 'version', 'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: TermSheetId): Promise<TermSheet | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(TermSheetOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? TermSheetMapper.toDomain(e) : null;
  }

  async findByDealId(tenantId: TenantId, dealId: string): Promise<TermSheet | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(TermSheetOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, dealId } });
    });
    return e ? TermSheetMapper.toDomain(e) : null;
  }
}

import { SettlementInstructionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { SettlementInstruction } from '../../domain/aggregates/settlement-instruction.aggregate';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';
import { SettlementInstructionOrmEntity } from './entities/settlement.orm-entities';
import { settlementInstructionFromOrm, settlementInstructionToOrm } from './mappers/settlement.mapper';

const PENDING_STATUSES = ['initiated', 'matched'];

const UPSERT_COLUMNS = [
  'trade_reference',
  'status',
  'settlement_type',
  'cycle',
  'settlement_date',
  'security_id',
  'quantity',
  'amount',
  'legs',
  'failure_reason',
  'version',
  'updated_at',
];

@Injectable()
export class PostgresSettlementInstructionRepository implements SettlementInstructionRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(instruction: SettlementInstruction): Promise<void> {
    const orm = settlementInstructionToOrm(instruction);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${instruction.tenantId.value}'`);
      await manager
        .getRepository(SettlementInstructionOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(SettlementInstructionOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLUMNS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: SettlementInstructionId): Promise<SettlementInstruction | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SettlementInstructionOrmEntity).findOne({
        where: { tenantId: tenantId.value, id: id.value },
      });
    });
    return e ? settlementInstructionFromOrm(e) : null;
  }

  async findByTradeReference(tenantId: TenantId, tradeReference: string): Promise<SettlementInstruction | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SettlementInstructionOrmEntity).findOne({
        where: { tenantId: tenantId.value, tradeReference },
      });
    });
    return e ? settlementInstructionFromOrm(e) : null;
  }

  async findPending(tenantId: TenantId): Promise<SettlementInstruction[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SettlementInstructionOrmEntity).find({
        where: { tenantId: tenantId.value, status: In(PENDING_STATUSES) },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(settlementInstructionFromOrm);
  }

  async findAll(tenantId: TenantId): Promise<SettlementInstruction[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager.getRepository(SettlementInstructionOrmEntity).find({
        where: { tenantId: tenantId.value },
        order: { createdAt: 'ASC' },
      });
    });
    return entities.map(settlementInstructionFromOrm);
  }
}

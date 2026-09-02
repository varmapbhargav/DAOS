import { InteractionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Interaction } from '../../domain/entities/interaction.entity';
import { InteractionRepository } from '../../domain/repositories/interaction.repository';
import { InteractionOrmEntity } from './entities/interaction.orm-entity';
import { InteractionMapper } from './mappers/interaction.mapper';

@Injectable()
export class PostgresInteractionRepository implements InteractionRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(interaction: Interaction): Promise<void> {
    const orm = InteractionMapper.toOrm(interaction);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${interaction.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(InteractionOrmEntity)
        .values(row)
        .orUpdate(
          [
            'case_id',
            'asset_id',
            'counterparty_id',
            'type',
            'direction',
            'subject',
            'body',
            'participants',
            'occurred_at',
            'recorded_by',
            'recorded_at',
            'metadata',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: InteractionId): Promise<Interaction | null> {
    const orm = await this.dataSource.manager.findOne(InteractionOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? InteractionMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Interaction[]> {
    const orms = await this.dataSource.manager.find(InteractionOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { occurredAt: 'DESC' } as any,
    });
    return orms.map(InteractionMapper.toDomain);
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<Interaction[]> {
    const orms = await this.dataSource.manager.find(InteractionOrmEntity, {
      where: { assetId, tenantId: tenantId.value },
      order: { occurredAt: 'DESC' } as any,
    });
    return orms.map(InteractionMapper.toDomain);
  }

  async findByCounterpartyId(tenantId: TenantId, counterpartyId: string): Promise<Interaction[]> {
    const orms = await this.dataSource.manager.find(InteractionOrmEntity, {
      where: { counterpartyId, tenantId: tenantId.value },
      order: { occurredAt: 'DESC' } as any,
    });
    return orms.map(InteractionMapper.toDomain);
  }

  async findByDateRange(tenantId: TenantId, from: string, to: string): Promise<Interaction[]> {
    const orms = await this.dataSource.manager.find(InteractionOrmEntity, {
      where: {
        tenantId: tenantId.value,
        occurredAt: {
          $gte: from,
          $lte: to,
        } as any,
      },
      order: { occurredAt: 'DESC' } as any,
    });
    return orms.map(InteractionMapper.toDomain);
  }
}
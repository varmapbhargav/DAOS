import { TenantId, ValuationId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Valuation } from '../../domain/entities/valuation.entity';
import { ValuationRepository } from '../../domain/repositories/valuation.repository';
import { ValuationOrmEntity } from './entities/valuation.orm-entity';
import { ValuationMapper } from './mappers/valuation.mapper';

@Injectable()
export class PostgresValuationRepository implements ValuationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(valuation: Valuation): Promise<void> {
    const orm = ValuationMapper.toOrm(valuation);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${valuation.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(ValuationOrmEntity)
        .values(row)
        .orUpdate(
          [
            'status',
            'current_market_value',
            'fair_value',
            'book_value',
            'nav',
            'face_value',
            'outstanding_principal',
            'indicative_acquisition_value',
            'purchase_price',
            'valuation_date',
            'valuation_source',
            'valuer',
            'methodology',
            'confidence',
            'currency',
            'reviewer',
            'reviewed_at',
            'approval_reason',
            'rejection_reason',
            'assigned_at',
            'uploaded_at',
            'approved_at',
            'rejected_at',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ValuationId): Promise<Valuation | null> {
    const orm = await this.dataSource.manager.findOne(ValuationOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? ValuationMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Valuation | null> {
    const orm = await this.dataSource.manager.findOne(ValuationOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { requestedAt: 'DESC' } as any,
    });
    return orm ? ValuationMapper.toDomain(orm) : null;
  }

  async findAllByCaseId(tenantId: TenantId, caseId: string): Promise<Valuation[]> {
    const orms = await this.dataSource.manager.find(ValuationOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { requestedAt: 'DESC' } as any,
    });
    return orms.map(ValuationMapper.toDomain);
  }
}
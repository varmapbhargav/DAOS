import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { InvestmentStrategyAggregate } from '../../domain/aggregates/investment-strategy.aggregate';
import { InvestmentStrategyRepository } from '../../domain/repositories/investment-strategy.repository';
import { InvestmentStrategyOrmEntity } from './entities/investment-strategy.orm-entity';
import { InvestmentStrategyMapper } from './mappers/investment-strategy.mapper';

@Injectable()
export class PostgresInvestmentStrategyRepository implements InvestmentStrategyRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(strategy: InvestmentStrategyAggregate): Promise<void> {
    const orm = InvestmentStrategyMapper.toOrm(strategy);
    const expectedVersion = strategy.version - 1;
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [orm.tenantId]);
      await manager
        .getRepository(InvestmentStrategyOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(InvestmentStrategyOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'opportunity_id',
            'name',
            'strategy_type',
            'description',
            'status',
            'entry',
            'operating',
            'financing',
            'value_creation',
            'exit',
            'investment_horizon_months',
            'constraints',
            'target_returns',
            'risk_tolerance',
            'version',
            'versions',
            'updated_at',
          ],
          ['id'],
        )
        .execute();

      if (expectedVersion > 0) {
        const updated = await manager
          .createQueryBuilder()
          .update(InvestmentStrategyOrmEntity)
          .set({ version: orm.version, updatedAt: new Date() })
          .where('id = :id AND version = :expectedVersion', { id: orm.id, expectedVersion })
          .execute();

        if (updated.affected === 0) {
          throw new Error('Optimistic lock failed: investment strategy was modified by another process');
        }
      }
    });
  }

  async findById(id: string): Promise<InvestmentStrategyAggregate | null> {
    const e = await this.ds.transaction(async (manager) => {
      return manager
        .getRepository(InvestmentStrategyOrmEntity)
        .findOne({ where: { id } });
    });
    return e ? InvestmentStrategyMapper.toDomain(e) : null;
  }

  async findByOpportunityId(opportunityId: string): Promise<InvestmentStrategyAggregate[]> {
    const entities = await this.ds.transaction(async (manager) => {
      return manager
        .getRepository(InvestmentStrategyOrmEntity)
        .find({ where: { opportunityId } });
    });
    return entities.map(InvestmentStrategyMapper.toDomain);
  }
}
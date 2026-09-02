import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { InvestmentThesisAggregate } from '../../domain/aggregates/investment-thesis.aggregate';
import { InvestmentThesisRepository } from '../../domain/repositories/investment-thesis.repository';
import { InvestmentThesisOrmEntity } from './entities/investment-thesis.orm-entity';
import { InvestmentThesisMapper } from './mappers/investment-thesis.mapper';

@Injectable()
export class PostgresInvestmentThesisRepository implements InvestmentThesisRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(thesis: InvestmentThesisAggregate): Promise<void> {
    const orm = InvestmentThesisMapper.toOrm(thesis);
    const expectedVersion = thesis.version - 1;
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = $1`, [orm.tenantId]);
      await manager
        .getRepository(InvestmentThesisOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(InvestmentThesisOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'opportunity_id',
            'thesis_statement',
            'executive_summary',
            'investment_rationale',
            'market_opportunity',
            'asset_rationale',
            'problem',
            'solution',
            'competitive_advantage',
            'value_creation_thesis',
            'key_catalysts',
            'key_risks',
            'risk_mitigation',
            'investment_horizon_months',
            'entry_thesis',
            'exit_strategy',
            'expected_return',
            'target_yield',
            'confidence_score',
            'status',
            'version',
            'approved_by',
            'versions',
            'updated_at',
          ],
          ['id'],
        )
        .execute();

      if (expectedVersion > 0) {
        const updated = await manager
          .createQueryBuilder()
          .update(InvestmentThesisOrmEntity)
          .set({ version: orm.version, updatedAt: new Date() })
          .where('id = :id AND version = :expectedVersion', { id: orm.id, expectedVersion })
          .execute();

        if (updated.affected === 0) {
          throw new Error('Optimistic lock failed: investment thesis was modified by another process');
        }
      }
    });
  }

  async findById(id: string): Promise<InvestmentThesisAggregate | null> {
    const e = await this.ds.transaction(async (manager) => {
      return manager
        .getRepository(InvestmentThesisOrmEntity)
        .findOne({ where: { id } });
    });
    return e ? InvestmentThesisMapper.toDomain(e) : null;
  }

  async findByOpportunityId(opportunityId: string): Promise<InvestmentThesisAggregate | null> {
    const e = await this.ds.transaction(async (manager) => {
      return manager
        .getRepository(InvestmentThesisOrmEntity)
        .findOne({ where: { opportunityId } });
    });
    return e ? InvestmentThesisMapper.toDomain(e) : null;
  }
}
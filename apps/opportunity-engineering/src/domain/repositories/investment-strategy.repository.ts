import { InvestmentStrategyAggregate } from '../../domain/aggregates/investment-strategy.aggregate';

export interface InvestmentStrategyRepository {
  save(strategy: InvestmentStrategyAggregate): Promise<void>;
  findById(id: string): Promise<InvestmentStrategyAggregate | null>;
  findByOpportunityId(opportunityId: string): Promise<InvestmentStrategyAggregate[]>;
}

export const INVESTMENT_STRATEGY_REPOSITORY = 'INVESTMENT_STRATEGY_REPOSITORY';
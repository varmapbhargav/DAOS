import { InvestmentThesisAggregate } from '../../domain/aggregates/investment-thesis.aggregate';

export interface InvestmentThesisRepository {
  save(thesis: InvestmentThesisAggregate): Promise<void>;
  findById(id: string): Promise<InvestmentThesisAggregate | null>;
  findByOpportunityId(opportunityId: string): Promise<InvestmentThesisAggregate | null>;
}

export const INVESTMENT_THESIS_REPOSITORY = 'INVESTMENT_THESIS_REPOSITORY';
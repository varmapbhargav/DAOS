import { InvestmentThesisAggregate, InvestmentThesisVersion, ExitStrategy } from '../../../domain/aggregates/investment-thesis.aggregate';
import { InvestmentThesisOrmEntity } from '../entities/investment-thesis.orm-entity';
import { Percentage, Decimal } from '../../../domain/value-objects/decimal.vo';

export class InvestmentThesisMapper {
  static toDomain(e: InvestmentThesisOrmEntity): InvestmentThesisAggregate {
    const thesis = InvestmentThesisAggregate.reconstruct({
      id: e.id,
      opportunityId: e.opportunityId,
      thesisStatement: e.thesisStatement,
      executiveSummary: e.executiveSummary,
      investmentRationale: e.investmentRationale,
      marketOpportunity: e.marketOpportunity,
      assetRationale: e.assetRationale,
      problem: e.problem,
      solution: e.solution,
      competitiveAdvantage: e.competitiveAdvantage,
      valueCreationThesis: e.valueCreationThesis,
      keyCatalysts: e.keyCatalysts ?? [],
      keyRisks: e.keyRisks ?? [],
      riskMitigation: e.riskMitigation ?? [],
      investmentHorizonMonths: e.investmentHorizonMonths,
      entryThesis: e.entryThesis,
      exitStrategy: e.exitStrategy as ExitStrategy,
      expectedReturn: e.expectedReturn as Percentage,
      targetYield: e.targetYield as Percentage,
      confidenceScore: e.confidenceScore as Percentage,
      status: e.status as any,
      version: e.version,
      createdBy: e.createdBy,
      approvedBy: e.approvedBy,
      versions: (e as any).versions as InvestmentThesisVersion[] ?? [],
    });
    return thesis;
  }

  static toOrm(domain: InvestmentThesisAggregate): InvestmentThesisOrmEntity {
    const e = new InvestmentThesisOrmEntity();
    e.id = domain.id;
    e.tenantId = ''; // Set by repository
    e.opportunityId = domain.opportunityId;
    e.thesisStatement = domain.thesisStatement;
    e.executiveSummary = domain.executiveSummary;
    e.investmentRationale = domain.investmentRationale;
    e.marketOpportunity = domain.marketOpportunity;
    e.assetRationale = domain.assetRationale;
    e.problem = domain.problem;
    e.solution = domain.solution;
    e.competitiveAdvantage = domain.competitiveAdvantage;
    e.valueCreationThesis = domain.valueCreationThesis;
    e.keyCatalysts = domain.keyCatalysts;
    e.keyRisks = domain.keyRisks;
    e.riskMitigation = domain.riskMitigation;
    e.investmentHorizonMonths = domain.investmentHorizonMonths;
    e.entryThesis = domain.entryThesis;
    e.exitStrategy = domain.exitStrategy as object;
    e.expectedReturn = domain.expectedReturn as object;
    e.targetYield = domain.targetYield as object;
    e.confidenceScore = domain.confidenceScore as object;
    e.status = domain.status;
    e.version = domain.version;
    e.createdBy = domain.createdBy;
    e.approvedBy = domain.approvedBy;
    (e as any).versions = domain.versions;
    return e;
  }
}
import { InvestmentStrategyAggregate, InvestmentStrategyVersion, StrategyType, StrategyStatus } from '../../../domain/aggregates/investment-strategy.aggregate';
import { InvestmentStrategyOrmEntity } from '../entities/investment-strategy.orm-entity';

export class InvestmentStrategyMapper {
  static toDomain(e: InvestmentStrategyOrmEntity): InvestmentStrategyAggregate {
    const strategy = InvestmentStrategyAggregate.reconstruct({
      id: e.id,
      opportunityId: e.opportunityId,
      name: e.name,
      strategyType: e.strategyType as StrategyType,
      description: e.description,
      status: e.status as StrategyStatus,
      entry: e.entry as any,
      operating: e.operating as any,
      financing: e.financing as any,
      valueCreation: e.valueCreation as any,
      exit: e.exit as any,
      investmentHorizonMonths: e.investmentHorizonMonths,
      constraints: e.constraints as any,
      targetReturns: e.targetReturns as any,
      riskTolerance: e.riskTolerance as any,
      version: e.version,
      createdBy: e.createdBy,
      versions: (e as any).versions as InvestmentStrategyVersion[] ?? [],
    });
    return strategy;
  }

  static toOrm(domain: InvestmentStrategyAggregate): InvestmentStrategyOrmEntity {
    const e = new InvestmentStrategyOrmEntity();
    e.id = domain.id;
    e.tenantId = ''; // Set by repository
    e.opportunityId = domain.opportunityId;
    e.name = domain.name;
    e.strategyType = domain.strategyType;
    e.description = domain.description;
    e.status = domain.status;
    e.entry = domain.entry as object;
    e.operating = domain.operating as object;
    e.financing = domain.financing as object;
    e.valueCreation = domain.valueCreation as object;
    e.exit = domain.exit as object;
    e.investmentHorizonMonths = domain.investmentHorizonMonths;
    e.constraints = domain.constraints as object;
    e.targetReturns = domain.targetReturns as object;
    e.riskTolerance = domain.riskTolerance as object;
    e.version = domain.version;
    e.createdBy = domain.createdBy;
    (e as any).versions = domain.versions;
    return e;
  }
}
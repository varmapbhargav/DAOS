import { ScenarioModelId, ScenarioType, TenantId } from '@daos/shared-kernel';

import { ScenarioModel, ScenarioVersion, ScenarioStatus } from '../../../domain/aggregates/scenario-model.aggregate';
import { ScenarioModelOrmEntity } from '../entities/scenario-model.orm-entity';
import { FinancialModel } from '../../../domain/value-objects/financial-model.vo';
import { AssumptionSet } from '../../../domain/value-objects/assumption.vo';

export class ScenarioModelMapper {
  static toDomain(e: ScenarioModelOrmEntity): ScenarioModel {
    const model = ScenarioModel.reconstruct({
      id: ScenarioModelId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      opportunityId: e.opportunityId,
      strategyId: e.strategyId,
      name: e.name,
      scenarioType: e.scenarioType as ScenarioType,
      status: e.status as ScenarioStatus,
      assumptions: e.assumptions as AssumptionSet | null,
      financialModel: e.financialModel as FinancialModel | null,
      holdPeriodMonths: e.holdPeriodMonths,
      isSelected: e.isSelected,
      versions: (e as any).versions as ScenarioVersion[] ?? [],
    });
    (model as any)._version = e.version;
    return model;
  }

  static toOrm(domain: ScenarioModel): ScenarioModelOrmEntity {
    const e = new ScenarioModelOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.opportunityId = domain.opportunityId;
    e.strategyId = domain.strategyId ?? null;
    e.name = domain.name;
    e.scenarioType = domain.scenarioType;
    e.status = domain.status;
    e.assumptions = domain.assumptions as object ?? null;
    e.financialModel = domain.financialModel as object ?? null;
    e.holdPeriodMonths = domain.holdPeriodMonths;
    e.isSelected = domain.isSelected;
    e.version = domain.version;
    (e as any).versions = domain.versions;
    return e;
  }
}
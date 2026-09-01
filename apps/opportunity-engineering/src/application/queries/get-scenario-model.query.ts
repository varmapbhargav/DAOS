import { ScenarioModelDto } from '@daos/opportunity-api';
import { NotFoundError, ScenarioModelId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SCENARIO_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ScenarioModelRepository } from '../../domain/repositories/scenario-model.repository';

export class GetScenarioModelQuery {
  constructor(public readonly scenarioModelId: string) {}
}

@QueryHandler(GetScenarioModelQuery)
export class GetScenarioModelHandler implements IQueryHandler<GetScenarioModelQuery, ScenarioModelDto> {
  constructor(@Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository) {}

  async execute(query: GetScenarioModelQuery): Promise<ScenarioModelDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const model = await this.scenarios.findById(tenantId, ScenarioModelId.create(query.scenarioModelId));
    if (!model) {
      throw new NotFoundError(`Scenario model not found: ${query.scenarioModelId}`);
    }
    const irr = model.financialModel?.returnMetrics.irrPercent?.toNumber() ?? null;
    const moic = model.financialModel?.returnMetrics.grossMoic?.toNumber() ?? null;
    return {
      id: model.id.value,
      tenantId: model.tenantId.value,
      opportunityId: model.opportunityId,
      strategyId: model.strategyId,
      name: model.name,
      scenarioType: model.scenarioType,
      status: model.status,
      assumptions: model.assumptions,
      financialModel: model.financialModel,
      projectedIrrPercent: irr,
      projectedMultiple: moic,
      holdPeriodMonths: model.holdPeriodMonths,
      isSelected: model.isSelected,
      version: model.version,
      versions: model.versions ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

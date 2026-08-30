import { ScenarioModelId, ScenarioType, TenantId } from '@daos/shared-kernel';

import { ScenarioModel } from '../../../domain/aggregates/scenario-model.aggregate';
import { ScenarioModelOrmEntity } from '../entities/scenario-model.orm-entity';

export class ScenarioModelMapper {
  static toDomain(e: ScenarioModelOrmEntity): ScenarioModel {
    return ScenarioModel.reconstruct({
      id: ScenarioModelId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      opportunityId: e.opportunityId,
      name: e.name,
      scenarioType: e.scenarioType as ScenarioType,
      status: e.status as 'draft' | 'approved',
      keyAssumptions: (e.keyAssumptions as Record<string, number>) ?? {},
      projectedIrrPercent: e.projectedIrrPercent,
      projectedMultiple: e.projectedMultiple,
      version: e.version,
    });
  }

  static toOrm(domain: ScenarioModel): ScenarioModelOrmEntity {
    const e = new ScenarioModelOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.opportunityId = domain.opportunityId;
    e.name = domain.name;
    e.scenarioType = domain.scenarioType;
    e.status = domain.status;
    e.keyAssumptions = domain.keyAssumptions;
    e.projectedIrrPercent = domain.projectedIrrPercent;
    e.projectedMultiple = domain.projectedMultiple;
    e.version = domain.version;
    return e;
  }
}

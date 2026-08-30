import { ScenarioModelId, TenantId } from '@daos/shared-kernel';

import { ScenarioModel } from '../aggregates/scenario-model.aggregate';

export interface ScenarioModelRepository {
  save(model: ScenarioModel): Promise<void>;
  findById(tenantId: TenantId, id: ScenarioModelId): Promise<ScenarioModel | null>;
  findByOpportunityId(tenantId: TenantId, opportunityId: string): Promise<ScenarioModel[]>;
}

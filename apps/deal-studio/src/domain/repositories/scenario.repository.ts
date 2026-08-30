import { ScenarioId, TenantId } from '@daos/shared-kernel';
import { Scenario } from '../entities/scenario.entity';

export interface ScenarioRepository {
  save(scenario: Scenario): Promise<void>;
  findById(tenantId: TenantId, id: ScenarioId): Promise<Scenario | null>;
  findByDealId(tenantId: TenantId, dealId: string): Promise<Scenario[]>;
}

import { ScenarioId, TenantId } from '@daos/shared-kernel';

import { Scenario } from '../../../domain/entities/scenario.entity';
import { ScenarioOrmEntity } from '../entities/scenario.orm-entity';

export class ScenarioMapper {
  static toDomain(e: ScenarioOrmEntity): Scenario {
    return Scenario.reconstruct({
      id: ScenarioId.create(e.id),
      dealId: e.dealId,
      tenantId: e.tenantId,
      type: e.type as 'BASE' | 'BULL' | 'BEAR' | 'STRESS',
      name: e.name,
      assumptions: e.assumptions as object,
      cashFlowPeriods: e.cashFlowPeriods as object[],
      result: e.result as object | null,
      version: e.version,
      createdBy: e.createdBy,
      createdAt: e.createdAt,
    });
  }

  static toOrm(domain: Scenario): ScenarioOrmEntity {
    const e = new ScenarioOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId;
    e.dealId = domain.dealId;
    e.type = domain.type;
    e.name = domain.name;
    e.assumptions = domain.assumptions;
    e.cashFlowPeriods = domain.cashFlowPeriods;
    e.result = domain.result;
    e.version = domain.version;
    e.createdBy = domain.createdBy;
    e.createdAt = new Date(domain.createdAt);
    e.updatedAt = new Date();
    return e;
  }
}

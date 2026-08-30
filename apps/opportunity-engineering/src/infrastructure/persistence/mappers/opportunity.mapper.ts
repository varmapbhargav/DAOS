import {
  OpportunityId,
  OpportunityScore,
  OpportunityStatus,
  SensitivityFactor,
  TargetReturnProfile,
  TenantId,
} from '@daos/shared-kernel';

import { Opportunity } from '../../../domain/aggregates/opportunity.aggregate';
import { OpportunityOrmEntity } from '../entities/opportunity.orm-entity';

export class OpportunityMapper {
  static toDomain(e: OpportunityOrmEntity): Opportunity {
    return Opportunity.reconstruct({
      id: OpportunityId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      name: e.name,
      sponsorId: e.sponsorId,
      status: e.status as OpportunityStatus,
      targetReturn: e.targetReturn as unknown as TargetReturnProfile | null,
      score: e.score as unknown as OpportunityScore | null,
      sensitivityFactors: (e.sensitivityFactors as unknown as SensitivityFactor[]) ?? [],
      scenarioModelIds: e.scenarioModelIds ?? [],
      approvedScenarioId: e.approvedScenarioId,
      approvedBy: e.approvedBy,
      rejectionReason: e.rejectionReason,
      version: e.version,
    });
  }

  static toOrm(domain: Opportunity): OpportunityOrmEntity {
    const e = new OpportunityOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.name = domain.name;
    e.sponsorId = domain.sponsorId;
    e.status = domain.status;
    e.targetReturn = domain.targetReturn;
    e.score = domain.score;
    e.sensitivityFactors = domain.sensitivityFactors;
    e.scenarioModelIds = domain.scenarioModelIds;
    e.approvedScenarioId = domain.approvedScenarioId;
    e.approvedBy = domain.approvedBy;
    e.rejectionReason = domain.rejectionReason;
    e.version = domain.version;
    return e;
  }
}

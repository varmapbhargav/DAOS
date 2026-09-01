import {
  OpportunityId,
  OpportunityScore,
  OpportunityStatus,
  SensitivityFactor,
  TargetReturnProfile,
  TenantId,
  ScenarioStatus,
  EngineeringStatus,
} from '@daos/shared-kernel';

import { Opportunity } from '../../../domain/aggregates/opportunity.aggregate';
import { OpportunityOrmEntity } from '../entities/opportunity.orm-entity';
import { SubWorkflowStatus, EngineeringReadiness } from '../../../domain/aggregates/opportunity.aggregate';

export class OpportunityMapper {
  static toDomain(e: OpportunityOrmEntity): Opportunity {
    const opp = Opportunity.reconstruct({
      id: OpportunityId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      name: e.name,
      description: e.description,
      sponsorId: e.sponsorId,
      status: e.status as OpportunityStatus,
      subStatus: e.subStatus as SubWorkflowStatus ?? {
        engineering: 'draft',
        scenario: 'not_started',
        financialModel: 'not_started',
        risk: 'not_started',
        optimization: 'not_started',
        review: 'not_submitted',
        approval: 'not_submitted',
        handoff: 'not_ready',
      },
      targetReturn: e.targetReturn as unknown as TargetReturnProfile | null,
      score: e.score as unknown as OpportunityScore | null,
      sensitivityFactors: (e.sensitivityFactors as unknown as SensitivityFactor[]) ?? [],
      scenarioModelIds: e.scenarioModelIds ?? [],
      selectedScenarioId: e.selectedScenarioId,
      approvedBy: e.approvedBy,
      rejectionReason: e.rejectionReason,
      readiness: e.readiness as EngineeringReadiness ?? {
        assetReady: false,
        thesisReady: false,
        strategyReady: false,
        financialModelReady: false,
        valuationReady: false,
        scenariosReady: false,
        sensitivityReady: false,
        monteCarloReady: false,
        riskReady: false,
        capitalReady: false,
        optimizationReady: false,
        recommendationReady: false,
        overall: 'not_ready',
      },
    });
    (opp as any)._version = e.version;
    return opp;
  }

  static toOrm(domain: Opportunity): OpportunityOrmEntity {
    const e = new OpportunityOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.name = domain.name;
    e.description = domain.description;
    e.sponsorId = domain.sponsorId;
    e.status = domain.status;
    e.subStatus = domain.subStatus;
    e.targetReturn = domain.targetReturn;
    e.score = domain.score;
    e.sensitivityFactors = domain.sensitivityFactors;
    e.scenarioModelIds = domain.scenarioModelIds;
    e.selectedScenarioId = domain.selectedScenarioId;
    e.approvedBy = domain.approvedBy;
    e.rejectionReason = domain.rejectionReason;
    e.readiness = domain.readiness;
    e.version = domain.version;
    return e;
  }
}
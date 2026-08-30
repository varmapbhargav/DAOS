import { OpportunityDto } from '@daos/opportunity-api';

import { Opportunity } from '../domain/aggregates/opportunity.aggregate';

export function toOpportunityDto(opportunity: Opportunity): OpportunityDto {
  return {
    id: opportunity.id.value,
    tenantId: opportunity.tenantId.value,
    assetId: opportunity.assetId,
    name: opportunity.name,
    status: opportunity.status,
    sponsorId: opportunity.sponsorId,
    targetReturn: opportunity.targetReturn
      ? {
          targetIrrPercent: opportunity.targetReturn.targetIrrPercent,
          targetMultiple: opportunity.targetReturn.targetMultiple,
          expectedHoldPeriodMonths: opportunity.targetReturn.expectedHoldPeriodMonths,
          upsidePotentialPercent: opportunity.targetReturn.upsidePotentialPercent,
          downsideRiskPercent: opportunity.targetReturn.downsideRiskPercent,
        }
      : null,
    score: opportunity.score,
    sensitivityFactors: opportunity.sensitivityFactors,
    modeledScenarioCount: opportunity.scenarioModelIds.length,
    approvedScenarioId: opportunity.approvedScenarioId,
    version: opportunity.version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

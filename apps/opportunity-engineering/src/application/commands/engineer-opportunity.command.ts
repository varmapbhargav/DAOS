import {
  OutboxPublisher,
  SensitivityFactor,
  TargetReturnProfile,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Opportunity } from '../../domain/aggregates/opportunity.aggregate';
import { OPPORTUNITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { EngineerOpportunityDto } from '../dto/engineer-opportunity.dto';

export class EngineerOpportunityCommand {
  constructor(public readonly dto: EngineerOpportunityDto) {}
}

@CommandHandler(EngineerOpportunityCommand)
export class EngineerOpportunityHandler
  implements ICommandHandler<EngineerOpportunityCommand, { opportunityId: string }>
{
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: EngineerOpportunityCommand): Promise<{ opportunityId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const targetReturn: TargetReturnProfile | null = dto.targetReturn
      ? {
          targetIrrPercent: dto.targetReturn.targetIrrPercent,
          targetMultiple: dto.targetReturn.targetMultiple,
          expectedHoldPeriodMonths: dto.targetReturn.expectedHoldPeriodMonths,
          upsidePotentialPercent: dto.targetReturn.upsidePotentialPercent,
          downsideRiskPercent: dto.targetReturn.downsideRiskPercent,
        }
      : null;

    const sensitivityFactors: SensitivityFactor[] = (dto.sensitivityFactors ?? []).map((f) => ({
      name: f.name,
      baseValue: f.baseValue,
      p10: f.p10,
      p90: f.p90,
    }));

    const opportunity = Opportunity.engineer({
      tenantId,
      assetId: dto.assetId,
      name: dto.name,
      sponsorId: dto.sponsorId,
      targetReturn,
      sensitivityFactors,
    });

    await this.opportunities.save(opportunity);
    await this.outbox.publish(opportunity.pullEvents());
    return { opportunityId: opportunity.id.value };
  }
}

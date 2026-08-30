import { NotFoundError, OutboxPublisher, OpportunityScore, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import { OPPORTUNITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { ScoreOpportunityDto } from '../dto/opportunity-action.dto';

export class ScoreOpportunityCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly dto: ScoreOpportunityDto,
  ) {}
}

@CommandHandler(ScoreOpportunityCommand)
export class ScoreOpportunityHandler implements ICommandHandler<ScoreOpportunityCommand, { status: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ScoreOpportunityCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const score: OpportunityScore = {
      overall: command.dto.overall,
      components: command.dto.components,
    };
    opportunity.scoreOpportunity(score);

    await this.opportunities.save(opportunity);
    await this.outbox.publish(opportunity.pullEvents());
    return { status: opportunity.status };
  }
}

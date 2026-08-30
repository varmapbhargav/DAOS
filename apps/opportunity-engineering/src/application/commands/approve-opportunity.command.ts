import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import { OPPORTUNITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';

export class ApproveOpportunityCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly approvedBy: string,
  ) {}
}

@CommandHandler(ApproveOpportunityCommand)
export class ApproveOpportunityHandler implements ICommandHandler<ApproveOpportunityCommand, { status: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveOpportunityCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    opportunity.approve(command.approvedBy);

    await this.opportunities.save(opportunity);
    await this.outbox.publish(opportunity.pullEvents());
    return { status: opportunity.status };
  }
}

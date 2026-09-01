import { NotFoundError, OutboxPublisher, ScenarioModelId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import {
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SCENARIO_MODEL_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { ScenarioModelRepository } from '../../domain/repositories/scenario-model.repository';

export class ApproveScenarioCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly scenarioModelId: string,
  ) {}
}

@CommandHandler(ApproveScenarioCommand)
export class ApproveScenarioHandler implements ICommandHandler<ApproveScenarioCommand, { status: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveScenarioCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const model = await this.scenarios.findById(tenantId, ScenarioModelId.create(command.scenarioModelId));
    if (!model) {
      throw new NotFoundError(`Scenario model not found: ${command.scenarioModelId}`);
    }

    if (model.opportunityId !== opportunity.id.value) {
      throw new Error('Scenario model does not belong to this opportunity');
    }

    model.approve(TenantContextHolder.requireTenantId());
    opportunity.selectScenario(model.id.value);

    await this.scenarios.save(model);
    await this.opportunities.save(opportunity);
    await this.outbox.publish(opportunity.pullEvents());
    return { status: opportunity.status };
  }
}

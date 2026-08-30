import { NotFoundError, OutboxPublisher, ScenarioModelId, ScenarioType, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import { ScenarioModel } from '../../domain/aggregates/scenario-model.aggregate';
import {
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SCENARIO_MODEL_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { ScenarioModelRepository } from '../../domain/repositories/scenario-model.repository';
import { AddScenarioDto } from '../dto/engineer-opportunity.dto';

export class AddScenarioCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly dto: AddScenarioDto,
  ) {}
}

@CommandHandler(AddScenarioCommand)
export class AddScenarioHandler implements ICommandHandler<AddScenarioCommand, { scenarioModelId: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddScenarioCommand): Promise<{ scenarioModelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const model = ScenarioModel.create({
      tenantId,
      opportunityId: opportunity.id.value,
      name: command.dto.name,
      scenarioType: command.dto.scenarioType as ScenarioType,
      keyAssumptions: command.dto.keyAssumptions,
    });

    opportunity.addScenario(model.id.value);

    await this.scenarios.save(model);
    await this.opportunities.save(opportunity);
    await this.outbox.publish(opportunity.pullEvents());
    return { scenarioModelId: model.id.value };
  }
}

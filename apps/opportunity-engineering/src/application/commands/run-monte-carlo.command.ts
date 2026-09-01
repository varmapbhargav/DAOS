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
import { MonteCarloSimulationService, MonteCarloConfig, MonteCarloResult } from '../../domain/services/monte-carlo-simulation.service';
import { AssumptionSet } from '../../domain/value-objects/assumption.vo';

export class RunMonteCarloCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly scenarioModelId: string,
    public readonly config: MonteCarloConfig,
  ) {}
}

@CommandHandler(RunMonteCarloCommand)
export class RunMonteCarloHandler implements ICommandHandler<RunMonteCarloCommand, MonteCarloResult> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RunMonteCarloCommand): Promise<MonteCarloResult> {
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

    if (!model.assumptions) {
      throw new Error('Scenario must have assumptions before running Monte Carlo');
    }

    const service = new MonteCarloSimulationService();
    const result = service.simulate(model.assumptions, command.config, model.holdPeriodMonths);

    // Store simulation result on the scenario model
    // Note: In a full implementation, we'd have a separate SimulationResult entity
    // For now, we'll store it in the financial model or as a separate field

    await this.outbox.publish(model.pullEvents());

    return result;
  }
}
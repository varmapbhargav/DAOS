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
import { SensitivityEngine } from '../../domain/services/sensitivity-engine';
import { SensitivityVariable } from '../../domain/value-objects/sensitivity.vo';
import { SensitivityAnalysisDto, SensitivityVariableDto } from '../dto/engineer-opportunity.dto';
import { Decimal, Percentage } from '../../domain/value-objects/decimal.vo';

function convertSensitivityVariable(dto: SensitivityVariableDto): SensitivityVariable {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    baseValue: new Decimal(dto.baseValue),
    unit: dto.unit,
    currency: dto.currency,
    minValue: new Decimal(dto.minValue),
    maxValue: new Decimal(dto.maxValue),
    steps: dto.steps,
  };
}

export class RunSensitivityAnalysisCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly scenarioModelId: string,
    public readonly variables: SensitivityVariableDto[],
  ) {}
}

@CommandHandler(RunSensitivityAnalysisCommand)
export class RunSensitivityAnalysisHandler implements ICommandHandler<RunSensitivityAnalysisCommand, any> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RunSensitivityAnalysisCommand): Promise<any> {
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
      throw new Error('Scenario must have assumptions before running sensitivity analysis');
    }

    const engine = new SensitivityEngine();
    const variables = command.variables.map(convertSensitivityVariable);
    const result = await engine.analyze(
      model.assumptions,
      variables,
      model.holdPeriodMonths,
      opportunity.id.value,
      model.id.value,
      TenantContextHolder.requireTenantId(),
    );

    // Store result on scenario model (in practice, would use a separate entity)
    await this.outbox.publish(model.pullEvents());

    return result;
  }
}
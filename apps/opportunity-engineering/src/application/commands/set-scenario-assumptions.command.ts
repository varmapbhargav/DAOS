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
import { AssumptionSet } from '../../domain/value-objects/assumption.vo';
import { Decimal } from '../../domain/value-objects/decimal.vo';
import { SetScenarioAssumptionsDto, AssumptionSetDto } from '../../application/dto/engineer-opportunity.dto';

export class SetScenarioAssumptionsCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly scenarioModelId: string,
    public readonly assumptionsDto: AssumptionSetDto,
  ) {}
}

function convertDtoToAssumptionSet(dto: AssumptionSetDto): AssumptionSet {
  const convertAssumption = (a: any) => ({
    ...a,
    value: new Decimal(a.value),
    confidence: new Decimal(a.confidence),
    min: a.min !== undefined ? new Decimal(a.min) : undefined,
    max: a.max !== undefined ? new Decimal(a.max) : undefined,
  });

  return {
    acquisition: {
      purchasePrice: convertAssumption(dto.acquisition.purchasePrice),
      acquisitionCosts: convertAssumption(dto.acquisition.acquisitionCosts),
      closingCosts: convertAssumption(dto.acquisition.closingCosts),
      initialCapex: convertAssumption(dto.acquisition.initialCapex),
    },
    financing: {
      loanAmount: convertAssumption(dto.financing.loanAmount),
      interestRate: convertAssumption(dto.financing.interestRate),
      loanTermMonths: convertAssumption(dto.financing.loanTermMonths),
      amortizationMonths: convertAssumption(dto.financing.amortizationMonths),
      ltv: convertAssumption(dto.financing.ltv),
      originationFee: convertAssumption(dto.financing.originationFee),
    },
    operating: {
      revenueGrowthRate: convertAssumption(dto.operating.revenueGrowthRate),
      occupancyRate: convertAssumption(dto.operating.occupancyRate),
      operatingExpenseRatio: convertAssumption(dto.operating.operatingExpenseRatio),
      maintenanceCapexPerUnit: convertAssumption(dto.operating.maintenanceCapexPerUnit),
      inflationRate: convertAssumption(dto.operating.inflationRate),
    },
    revenue: {
      streams: dto.revenue.streams.map(s => ({
        ...s,
        volume: convertAssumption(s.volume),
        unit: convertAssumption(s.unit),
        price: convertAssumption(s.price),
        growthRate: convertAssumption(s.growthRate),
        escalationRate: convertAssumption(s.escalationRate),
        occupancyRate: convertAssumption(s.occupancyRate),
        utilizationRate: convertAssumption(s.utilizationRate),
        seasonalityFactor: convertAssumption(s.seasonalityFactor),
        startDate: convertAssumption(s.startDate),
        endDate: convertAssumption(s.endDate),
      })),
    },
    expense: {
      lines: dto.expense.lines.map(l => ({
        ...l,
        amount: convertAssumption(l.amount),
        percentageOfRevenue: l.percentageOfRevenue ? convertAssumption(l.percentageOfRevenue) : undefined,
        growthRate: convertAssumption(l.growthRate),
        inflationRate: convertAssumption(l.inflationRate),
        perUnit: convertAssumption(l.perUnit),
        period: convertAssumption(l.period),
      })),
    },
    exit: {
      exitDate: convertAssumption(dto.exit.exitDate),
      exitValuationMethod: convertAssumption(dto.exit.exitValuationMethod),
      exitMultiple: convertAssumption(dto.exit.exitMultiple),
      exitCapRate: convertAssumption(dto.exit.exitCapRate),
      exitCosts: convertAssumption(dto.exit.exitCosts),
    },
    risk: {
      marketVolatility: convertAssumption(dto.risk.marketVolatility),
      assetVolatility: convertAssumption(dto.risk.assetVolatility),
      correlationMatrix: convertAssumption(dto.risk.correlationMatrix),
    },
  };
}

@CommandHandler(SetScenarioAssumptionsCommand)
export class SetScenarioAssumptionsHandler implements ICommandHandler<SetScenarioAssumptionsCommand, { status: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SetScenarioAssumptionsCommand): Promise<{ status: string }> {
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

    const assumptions = convertDtoToAssumptionSet(command.assumptionsDto);
    model.setAssumptions(assumptions, TenantContextHolder.requireTenantId());

    await this.scenarios.save(model);
    await this.outbox.publish(model.pullEvents());

    return { status: model.status };
  }
}
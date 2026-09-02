import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import {
  INVESTMENT_STRATEGY_REPOSITORY,
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestmentStrategyRepository } from '../../domain/repositories/investment-strategy.repository';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { InvestmentStrategyAggregate } from '../../domain/aggregates/investment-strategy.aggregate';
import { 
  InvestmentStrategyDto, 
  StrategyConstraintDto, 
  TargetReturnsDto,
  StrategyEntryDto,
  StrategyOperatingDto,
  StrategyFinancingDto,
  StrategyValueCreationDto,
  StrategyExitDto,
} from '../dto/engineer-opportunity.dto';
import { Percentage, Decimal } from '../../domain/value-objects/decimal.vo';
import { 
  StrategyEntry, 
  StrategyOperating, 
  StrategyFinancing, 
  StrategyValueCreation, 
  StrategyExit,
  StrategyConstraint 
} from '../../domain/value-objects/investment-strategy.vo';

function convertStrategyEntry(dto: StrategyEntryDto): StrategyEntry {
  return {
    approach: dto.approach,
    targetPrice: new Decimal(dto.targetPrice),
    timing: dto.timing,
    conditions: dto.conditions,
  };
}

function convertStrategyOperating(dto: StrategyOperatingDto): StrategyOperating {
  return {
    valueCreationPlan: dto.valueCreationPlan,
    operationalImprovements: dto.operationalImprovements,
    managementChanges: dto.managementChanges,
    capexPlan: new Decimal(dto.capexPlan),
  };
}

function convertStrategyFinancing(dto: StrategyFinancingDto): StrategyFinancing {
  return {
    structure: dto.structure,
    leverageTarget: Percentage.fromNumber(dto.leverageTarget),
    debtType: dto.debtType,
    equityStructure: dto.equityStructure,
    preferredReturn: Percentage.fromNumber(dto.preferredReturn),
  };
}

function convertStrategyValueCreation(dto: StrategyValueCreationDto): StrategyValueCreation {
  return {
    drivers: dto.drivers,
    expectedUplift: Percentage.fromNumber(dto.expectedUplift),
    timelineMonths: dto.timelineMonths,
    investmentRequired: new Decimal(dto.investmentRequired),
  };
}

function convertStrategyExit(dto: StrategyExitDto): StrategyExit {
  return {
    type: dto.type,
    targetTiming: dto.targetTiming,
    targetMultiple: new Decimal(dto.targetMultiple),
    conditions: dto.conditions,
  };
}

function convertConstraints(dtos: StrategyConstraintDto[]): StrategyConstraint[] {
  return dtos.map(c => ({
    id: c.id,
    type: c.type,
    name: c.name,
    value: new Decimal(c.value),
    unit: c.unit,
    description: c.description,
  }));
}

function convertTargetReturns(dto: TargetReturnsDto) {
  return {
    targetIrr: Percentage.fromNumber(dto.targetIrr),
    targetMoic: new Decimal(dto.targetMoic),
    targetCashYield: Percentage.fromNumber(dto.targetCashYield),
  };
}

function convertRiskTolerance(dto: number): any {
  return Percentage.fromNumber(dto);
}

export class CreateInvestmentStrategyCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly dto: InvestmentStrategyDto,
  ) {}
}

@CommandHandler(CreateInvestmentStrategyCommand)
export class CreateInvestmentStrategyHandler implements ICommandHandler<CreateInvestmentStrategyCommand, { strategyId: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(INVESTMENT_STRATEGY_REPOSITORY) private readonly strategies: InvestmentStrategyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateInvestmentStrategyCommand): Promise<{ strategyId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const strategyId = `strat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const strategy = InvestmentStrategyAggregate.create({
      id: strategyId,
      opportunityId: opportunity.id.value,
      name: command.dto.name,
      strategyType: command.dto.strategyType,
      description: command.dto.description,
      entry: convertStrategyEntry(command.dto.entry),
      operating: convertStrategyOperating(command.dto.operating),
      financing: convertStrategyFinancing(command.dto.financing),
      valueCreation: convertStrategyValueCreation(command.dto.valueCreation),
      exit: convertStrategyExit(command.dto.exit),
      investmentHorizonMonths: command.dto.investmentHorizonMonths,
      constraints: convertConstraints(command.dto.constraints),
      targetReturns: convertTargetReturns(command.dto.targetReturns),
      riskTolerance: convertRiskTolerance(command.dto.riskTolerance),
      createdBy: TenantContextHolder.requireTenantId(),
    });

    await this.strategies.save(strategy);
    await this.outbox.publish(strategy.pullEvents());

    return { strategyId };
  }
}

export class UpdateInvestmentStrategyCommand {
  constructor(
    public readonly strategyId: string,
    public readonly updates: Partial<InvestmentStrategyDto>,
  ) {}
}

@CommandHandler(UpdateInvestmentStrategyCommand)
export class UpdateInvestmentStrategyHandler implements ICommandHandler<UpdateInvestmentStrategyCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_STRATEGY_REPOSITORY) private readonly strategies: InvestmentStrategyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateInvestmentStrategyCommand): Promise<{ status: string }> {
    const strategy = await this.strategies.findById(command.strategyId);
    if (!strategy) {
      throw new NotFoundError(`Investment strategy not found: ${command.strategyId}`);
    }

    const actorId = TenantContextHolder.requireTenantId();

    if (command.updates.name) strategy.updateName(command.updates.name, actorId);
    if (command.updates.description) strategy.updateDescription(command.updates.description, actorId);
    if (command.updates.entry) strategy.updateEntry(convertStrategyEntry(command.updates.entry), actorId);
    if (command.updates.operating) strategy.updateOperating(convertStrategyOperating(command.updates.operating), actorId);
    if (command.updates.financing) strategy.updateFinancing(convertStrategyFinancing(command.updates.financing), actorId);
    if (command.updates.valueCreation) strategy.updateValueCreation(convertStrategyValueCreation(command.updates.valueCreation), actorId);
    if (command.updates.exit) strategy.updateExit(convertStrategyExit(command.updates.exit), actorId);
    if (command.updates.investmentHorizonMonths) strategy.updateInvestmentHorizon(command.updates.investmentHorizonMonths, actorId);
    if (command.updates.targetReturns) {
      const dto = command.updates.targetReturns as any;
      strategy.updateTargetReturns({
        targetIrr: dto.targetIrr ? Percentage.fromNumber(dto.targetIrr) : strategy.targetReturns.targetIrr,
        targetMoic: dto.targetMoic ? new Decimal(dto.targetMoic) : strategy.targetReturns.targetMoic,
        targetCashYield: dto.targetCashYield ? Percentage.fromNumber(dto.targetCashYield) : strategy.targetReturns.targetCashYield,
      }, actorId);
    }
    if (command.updates.riskTolerance) strategy.updateRiskTolerance(Percentage.fromNumber(command.updates.riskTolerance), actorId);

    await this.strategies.save(strategy);
    await this.outbox.publish(strategy.pullEvents());

    return { status: strategy.status };
  }
}

export class AddStrategyConstraintCommand {
  constructor(
    public readonly strategyId: string,
    public readonly constraint: any,
  ) {}
}

@CommandHandler(AddStrategyConstraintCommand)
export class AddStrategyConstraintHandler implements ICommandHandler<AddStrategyConstraintCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_STRATEGY_REPOSITORY) private readonly strategies: InvestmentStrategyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddStrategyConstraintCommand): Promise<{ status: string }> {
    const strategy = await this.strategies.findById(command.strategyId);
    if (!strategy) {
      throw new NotFoundError(`Investment strategy not found: ${command.strategyId}`);
    }

    strategy.addConstraint(command.constraint, TenantContextHolder.requireTenantId());

    await this.strategies.save(strategy);
    await this.outbox.publish(strategy.pullEvents());

    return { status: strategy.status };
  }
}

export class SelectInvestmentStrategyCommand {
  constructor(public readonly strategyId: string) {}
}

@CommandHandler(SelectInvestmentStrategyCommand)
export class SelectInvestmentStrategyHandler implements ICommandHandler<SelectInvestmentStrategyCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_STRATEGY_REPOSITORY) private readonly strategies: InvestmentStrategyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SelectInvestmentStrategyCommand): Promise<{ status: string }> {
    const strategy = await this.strategies.findById(command.strategyId);
    if (!strategy) {
      throw new NotFoundError(`Investment strategy not found: ${command.strategyId}`);
    }

    strategy.select(TenantContextHolder.requireTenantId());

    await this.strategies.save(strategy);
    await this.outbox.publish(strategy.pullEvents());

    return { status: strategy.status };
  }
}
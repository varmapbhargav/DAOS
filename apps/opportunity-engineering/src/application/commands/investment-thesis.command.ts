import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import {
  INVESTMENT_THESIS_REPOSITORY,
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestmentThesisRepository } from '../../domain/repositories/investment-thesis.repository';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { InvestmentThesisAggregate, ExitStrategy } from '../../domain/aggregates/investment-thesis.aggregate';
import { InvestmentThesisDto, ExitStrategyDto } from '../dto/engineer-opportunity.dto';
import { Percentage, Decimal } from '../../domain/value-objects/decimal.vo';

function convertExitStrategyDto(dto: ExitStrategyDto): ExitStrategy {
  return {
    type: dto.type,
    targetDate: new Date(dto.targetDate),
    targetValue: new Decimal(dto.targetValue),
    assumptions: dto.assumptions,
    probability: Percentage.fromNumber(dto.probability),
  };
}

export class CreateInvestmentThesisCommand {
  constructor(
    public readonly opportunityId: string,
    public readonly dto: InvestmentThesisDto,
  ) {}
}

@CommandHandler(CreateInvestmentThesisCommand)
export class CreateInvestmentThesisHandler implements ICommandHandler<CreateInvestmentThesisCommand, { thesisId: string }> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(INVESTMENT_THESIS_REPOSITORY) private readonly theses: InvestmentThesisRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateInvestmentThesisCommand): Promise<{ thesisId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const thesisId = `thesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const thesis = InvestmentThesisAggregate.create({
      id: thesisId,
      opportunityId: opportunity.id.value,
      thesisStatement: command.dto.thesisStatement,
      executiveSummary: command.dto.executiveSummary,
      investmentRationale: command.dto.investmentRationale,
      marketOpportunity: command.dto.marketOpportunity,
      assetRationale: command.dto.assetRationale,
      problem: command.dto.problem,
      solution: command.dto.solution,
      competitiveAdvantage: command.dto.competitiveAdvantage,
      valueCreationThesis: command.dto.valueCreationThesis,
      keyCatalysts: command.dto.keyCatalysts ?? [],
      keyRisks: command.dto.keyRisks ?? [],
      riskMitigation: command.dto.riskMitigation ?? [],
      investmentHorizonMonths: command.dto.investmentHorizonMonths,
      entryThesis: command.dto.entryThesis,
      exitStrategy: convertExitStrategyDto(command.dto.exitStrategy),
      expectedReturn: Percentage.fromNumber(command.dto.expectedReturn),
      targetYield: Percentage.fromNumber(command.dto.targetYield),
      confidenceScore: Percentage.fromNumber(command.dto.confidenceScore),
      createdBy: TenantContextHolder.requireTenantId(),
    });

    await this.theses.save(thesis);
    await this.outbox.publish(thesis.pullEvents());

    return { thesisId };
  }
}

export class UpdateInvestmentThesisCommand {
  constructor(
    public readonly thesisId: string,
    public readonly updates: Partial<InvestmentThesisDto>,
  ) {}
}

@CommandHandler(UpdateInvestmentThesisCommand)
export class UpdateInvestmentThesisHandler implements ICommandHandler<UpdateInvestmentThesisCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_THESIS_REPOSITORY) private readonly theses: InvestmentThesisRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateInvestmentThesisCommand): Promise<{ status: string }> {
    const thesis = await this.theses.findById(command.thesisId);
    if (!thesis) {
      throw new NotFoundError(`Investment thesis not found: ${command.thesisId}`);
    }

    const actorId = TenantContextHolder.requireTenantId();

    if (command.updates.thesisStatement) thesis.updateThesisStatement(command.updates.thesisStatement, actorId);
    if (command.updates.executiveSummary) thesis.updateExecutiveSummary(command.updates.executiveSummary, actorId);
    if (command.updates.investmentRationale) thesis.updateInvestmentRationale(command.updates.investmentRationale, actorId);
    if (command.updates.marketOpportunity) thesis.updateMarketOpportunity(command.updates.marketOpportunity, actorId);
    if (command.updates.assetRationale) thesis.updateAssetRationale(command.updates.assetRationale, actorId);
    if (command.updates.problem) thesis.updateProblemSolution(command.updates.problem, thesis.solution, actorId);
    if (command.updates.solution) thesis.updateProblemSolution(thesis.problem, command.updates.solution, actorId);
    if (command.updates.competitiveAdvantage) thesis.updateCompetitiveAdvantage(command.updates.competitiveAdvantage, actorId);
    if (command.updates.valueCreationThesis) thesis.updateValueCreationThesis(command.updates.valueCreationThesis, actorId);
    if (command.updates.keyCatalysts) thesis.updateKeyCatalysts(command.updates.keyCatalysts, actorId);
    if (command.updates.keyRisks) thesis.updateKeyRisks(command.updates.keyRisks, actorId);
    if (command.updates.riskMitigation) thesis.updateRiskMitigation(command.updates.riskMitigation, actorId);
    if (command.updates.investmentHorizonMonths) thesis.updateInvestmentHorizon(command.updates.investmentHorizonMonths, actorId);
    if (command.updates.entryThesis) thesis.updateEntryThesis(command.updates.entryThesis, actorId);
    if (command.updates.exitStrategy) thesis.updateExitStrategy(convertExitStrategyDto(command.updates.exitStrategy), actorId);
    if (command.updates.expectedReturn) thesis.updateExpectedReturn(Percentage.fromNumber(command.updates.expectedReturn), actorId);
    if (command.updates.targetYield) thesis.updateTargetYield(Percentage.fromNumber(command.updates.targetYield), actorId);
    if (command.updates.confidenceScore) thesis.updateConfidenceScore(Percentage.fromNumber(command.updates.confidenceScore), actorId);

    await this.theses.save(thesis);
    await this.outbox.publish(thesis.pullEvents());

    return { status: thesis.status };
  }
}

export class FinalizeInvestmentThesisCommand {
  constructor(public readonly thesisId: string) {}
}

@CommandHandler(FinalizeInvestmentThesisCommand)
export class FinalizeInvestmentThesisHandler implements ICommandHandler<FinalizeInvestmentThesisCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_THESIS_REPOSITORY) private readonly theses: InvestmentThesisRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: FinalizeInvestmentThesisCommand): Promise<{ status: string }> {
    const thesis = await this.theses.findById(command.thesisId);
    if (!thesis) {
      throw new NotFoundError(`Investment thesis not found: ${command.thesisId}`);
    }

    thesis.finalize(TenantContextHolder.requireTenantId());

    await this.theses.save(thesis);
    await this.outbox.publish(thesis.pullEvents());

    return { status: thesis.status };
  }
}

export class ApproveInvestmentThesisCommand {
  constructor(public readonly thesisId: string) {}
}

@CommandHandler(ApproveInvestmentThesisCommand)
export class ApproveInvestmentThesisHandler implements ICommandHandler<ApproveInvestmentThesisCommand, { status: string }> {
  constructor(
    @Inject(INVESTMENT_THESIS_REPOSITORY) private readonly theses: InvestmentThesisRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveInvestmentThesisCommand): Promise<{ status: string }> {
    const thesis = await this.theses.findById(command.thesisId);
    if (!thesis) {
      throw new NotFoundError(`Investment thesis not found: ${command.thesisId}`);
    }

    thesis.approve(TenantContextHolder.requireTenantId());

    await this.theses.save(thesis);
    await this.outbox.publish(thesis.pullEvents());

    return { status: thesis.status };
  }
}
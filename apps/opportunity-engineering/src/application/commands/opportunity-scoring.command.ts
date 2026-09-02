import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OpportunityId } from '@daos/shared-kernel';

import {
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SCENARIO_MODEL_REPOSITORY,
  INVESTMENT_THESIS_REPOSITORY,
  INVESTMENT_STRATEGY_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { OpportunityRepository } from '../../domain/repositories/opportunity.repository';
import { ScenarioModelRepository } from '../../domain/repositories/scenario-model.repository';
import { InvestmentThesisRepository } from '../../domain/repositories/investment-thesis.repository';
import { InvestmentStrategyRepository } from '../../domain/repositories/investment-strategy.repository';
import { OpportunityScoringEngine } from '../../domain/services/opportunity-scoring-engine';
import { OpportunityScoreDto } from '../dto/engineer-opportunity.dto';
import { Decimal } from '../../domain/value-objects/decimal.vo';

export class CalculateOpportunityScoreCommand {
  constructor(
    public readonly opportunityId: string,
  ) {}
}

@CommandHandler(CalculateOpportunityScoreCommand)
export class CalculateOpportunityScoreHandler implements ICommandHandler<CalculateOpportunityScoreCommand, OpportunityScoreDto> {
  constructor(
    @Inject(OPPORTUNITY_REPOSITORY) private readonly opportunities: OpportunityRepository,
    @Inject(SCENARIO_MODEL_REPOSITORY) private readonly scenarios: ScenarioModelRepository,
    @Inject(INVESTMENT_THESIS_REPOSITORY) private readonly theses: InvestmentThesisRepository,
    @Inject(INVESTMENT_STRATEGY_REPOSITORY) private readonly strategies: InvestmentStrategyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CalculateOpportunityScoreCommand): Promise<OpportunityScoreDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const opportunity = await this.opportunities.findById(
      tenantId,
      OpportunityId.create(command.opportunityId),
    );
    if (!opportunity) {
      throw new NotFoundError(`Opportunity not found: ${command.opportunityId}`);
    }

    const scenarioModels = await this.scenarios.findByOpportunityId(tenantId, opportunity.id.value);
    const thesis = await this.theses.findByOpportunityId(opportunity.id.value);
    const strategyList = await this.strategies.findByOpportunityId(opportunity.id.value);

    const engine = new OpportunityScoringEngine();
    const score = engine.calculateScore({
      opportunity,
      thesis: thesis ?? undefined,
      strategies: strategyList ?? [],
      scenarios: scenarioModels ?? [],
      calculatedBy: TenantContextHolder.requireTenantId(),
    });

    const scoreDto: OpportunityScoreDto = {
      overall: score.overall.toNumber(),
      dimensions: score.dimensions.map(d => ({
        dimension: d.dimension,
        score: d.score.toNumber(),
        weight: d.weight.toNumber(),
        weightedScore: d.weightedScore.toNumber(),
        rationale: d.rationale,
        evidence: d.evidence,
      })),
      scoringModelVersion: score.scoringModelVersion,
      calculatedAt: score.calculatedAt.toISOString(),
      calculatedBy: score.calculatedBy,
    };

    // In a full implementation, we'd store the score on the opportunity
    // For now, we'll just publish events
    await this.outbox.publish(opportunity.pullEvents());

    return scoreDto;
  }
}
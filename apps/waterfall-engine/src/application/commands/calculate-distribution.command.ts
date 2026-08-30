import { DistributionId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DISTRIBUTION_REPOSITORY, OUTBOX_PUBLISHER, WATERFALL_MODEL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';
import { WaterfallModelRepository } from '../../domain/repositories/waterfall-model.repository';
import { WaterfallCalculationService } from '../../domain/services/waterfall-calculation.service';
import { CalculateDistributionDto } from '../dto/waterfall.dto';

export class CalculateDistributionCommand {
  constructor(
    public readonly distributionId: string,
    public readonly dto: CalculateDistributionDto,
  ) {}
}

@CommandHandler(CalculateDistributionCommand)
export class CalculateDistributionHandler
  implements ICommandHandler<CalculateDistributionCommand, { distributionId: string }>
{
  constructor(
    @Inject(DISTRIBUTION_REPOSITORY) private readonly distributions: DistributionRepository,
    @Inject(WATERFALL_MODEL_REPOSITORY) private readonly models: WaterfallModelRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly calculator: WaterfallCalculationService,
  ) {}

  async execute(command: CalculateDistributionCommand): Promise<{ distributionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const distribution = await this.distributions.findById(tenantId, DistributionId.create(command.distributionId));
    if (!distribution) throw new NotFoundError(`Distribution not found: ${command.distributionId}`);

    const models = await this.models.findApproved(tenantId);
    const model = models.find((m) => m.productId === distribution.productId);
    if (!model) throw new NotFoundError(`No approved waterfall model for product: ${distribution.productId}`);

    const result = this.calculator.calculate({
      currency: distribution.currency,
      grossAmount: distribution.totalAmount,
      distributionType: distribution.distributionType,
      waterfallType: model.waterfallType,
      tiers: model.tiers,
      investorShares: command.dto.investorShares,
      taxProfiles: command.dto.taxProfiles,
    });

    distribution.calculate({
      investorDistributions: result.investorDistributions,
      promote: result.promote,
      carriedInterest: result.carriedInterest,
    });

    await this.distributions.save(distribution);
    await this.outbox.publish(distribution.pullEvents());
    return { distributionId: distribution.id.value };
  }
}

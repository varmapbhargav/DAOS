import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Distribution } from '../../domain/aggregates/distribution.aggregate';
import { DISTRIBUTION_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';
import { DeclareDistributionDto } from '../dto/waterfall.dto';

export class DeclareDistributionCommand {
  constructor(public readonly dto: DeclareDistributionDto) {}
}

@CommandHandler(DeclareDistributionCommand)
export class DeclareDistributionHandler implements ICommandHandler<DeclareDistributionCommand, { distributionId: string }> {
  constructor(
    @Inject(DISTRIBUTION_REPOSITORY) private readonly distributions: DistributionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: DeclareDistributionCommand): Promise<{ distributionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const distribution = Distribution.declare({
      tenantId,
      productId: command.dto.productId,
      distributionType: command.dto.distributionType as Distribution['distributionType'],
      currency: command.dto.currency,
      totalAmount: BigInt(command.dto.totalAmount),
      recordDate: command.dto.recordDate,
      paymentDate: command.dto.paymentDate,
    });
    await this.distributions.save(distribution);
    await this.outbox.publish(distribution.pullEvents());
    return { distributionId: distribution.id.value };
  }
}

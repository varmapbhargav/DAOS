import { DistributionId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DISTRIBUTION_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DistributionRepository } from '../../domain/repositories/distribution.repository';

export class PayDistributionCommand {
  constructor(public readonly distributionId: string) {}
}

@CommandHandler(PayDistributionCommand)
export class PayDistributionHandler implements ICommandHandler<PayDistributionCommand, { distributionId: string }> {
  constructor(
    @Inject(DISTRIBUTION_REPOSITORY) private readonly distributions: DistributionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: PayDistributionCommand): Promise<{ distributionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const distribution = await this.distributions.findById(tenantId, DistributionId.create(command.distributionId));
    if (!distribution) throw new NotFoundError(`Distribution not found: ${command.distributionId}`);
    distribution.pay();
    await this.distributions.save(distribution);
    await this.outbox.publish(distribution.pullEvents());
    return { distributionId: distribution.id.value };
  }
}

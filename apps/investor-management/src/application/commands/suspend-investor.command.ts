import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { INVESTOR_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';

export class SuspendInvestorCommand {
  constructor(
    public readonly investorId: string,
    public readonly reason: string,
  ) {}
}

@CommandHandler(SuspendInvestorCommand)
export class SuspendInvestorHandler implements ICommandHandler<SuspendInvestorCommand, void> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SuspendInvestorCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    investor.suspend(command.reason);

    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
  }
}

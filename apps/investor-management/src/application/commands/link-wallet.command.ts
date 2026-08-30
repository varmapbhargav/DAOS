import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, WalletId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { INVESTOR_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';

export class LinkWalletCommand {
  constructor(
    public readonly investorId: string,
    public readonly address: string,
  ) {}
}

@CommandHandler(LinkWalletCommand)
export class LinkWalletHandler implements ICommandHandler<LinkWalletCommand, { walletId: string }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: LinkWalletCommand): Promise<{ walletId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    const walletId = WalletId.create();
    investor.linkWallet(walletId, command.address);

    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
    return { walletId: walletId.value };
  }
}

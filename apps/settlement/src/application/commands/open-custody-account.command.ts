import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CustodyAccount } from '../../domain/aggregates/custody-account.aggregate';
import { CUSTODY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CustodyAccountRepository } from '../../domain/repositories/custody-account.repository';
import { OpenCustodyAccountDto } from '../dto/settlement.dto';

export class OpenCustodyAccountCommand {
  constructor(public readonly dto: OpenCustodyAccountDto) {}
}

@CommandHandler(OpenCustodyAccountCommand)
export class OpenCustodyAccountHandler
  implements ICommandHandler<OpenCustodyAccountCommand, { accountId: string }>
{
  constructor(
    @Inject(CUSTODY_REPOSITORY) private readonly accounts: CustodyAccountRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: OpenCustodyAccountCommand): Promise<{ accountId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const existing = await this.accounts.findByInvestorId(tenantId, command.dto.investorId);
    if (existing) return { accountId: existing.id.value };
    const account = CustodyAccount.open({
      tenantId,
      investorId: command.dto.investorId,
      custodyType: command.dto.custodyType as CustodyAccount['custodyType'],
      custodianRef: command.dto.custodianRef,
    });
    await this.accounts.save(account);
    await this.outbox.publish(account.pullEvents());
    return { accountId: account.id.value };
  }
}

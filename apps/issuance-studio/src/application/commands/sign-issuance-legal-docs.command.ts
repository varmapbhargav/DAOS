import { IssuanceId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISSUANCE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';

export class SignIssuanceLegalDocsCommand {
  constructor(
    public readonly issuanceId: string,
    public readonly signedBy: string,
  ) {}
}

@CommandHandler(SignIssuanceLegalDocsCommand)
export class SignIssuanceLegalDocsHandler
  implements ICommandHandler<SignIssuanceLegalDocsCommand, { status: string }>
{
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SignIssuanceLegalDocsCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(command.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${command.issuanceId}`);

    issuance.signLegalDocs(command.signedBy);
    await this.issuances.save(issuance);
    await this.outbox.publish(issuance.pullEvents());
    return { status: issuance.status };
  }
}
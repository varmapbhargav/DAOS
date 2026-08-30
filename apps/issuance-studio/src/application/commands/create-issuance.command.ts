import { OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Issuance } from '../../domain/aggregates/issuance.aggregate';
import { ISSUANCE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';
import { CreateIssuanceDto } from '../dto/create-issuance.dto';

export class CreateIssuanceCommand {
  constructor(public readonly dto: CreateIssuanceDto) {}
}

@CommandHandler(CreateIssuanceCommand)
export class CreateIssuanceHandler implements ICommandHandler<CreateIssuanceCommand, { issuanceId: string }> {
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateIssuanceCommand): Promise<{ issuanceId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = Issuance.create({
      tenantId,
      name: command.dto.name,
      instrumentType: command.dto.instrumentType,
      network: command.dto.network,
      capTableId: command.dto.capTableId ?? null,
    });
    await this.issuances.save(issuance);
    await this.outbox.publish(issuance.pullEvents());
    return { issuanceId: issuance.id.value };
  }
}
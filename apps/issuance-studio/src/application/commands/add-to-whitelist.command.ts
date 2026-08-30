import { BlockchainGatewayPort, IssuanceId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BLOCKCHAIN_GATEWAY, ISSUANCE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { IssuanceRepository } from '../../domain/repositories/issuance.repository';
import { AddToWhitelistDto } from '../dto/issuance-action.dto';

export class AddToWhitelistCommand {
  constructor(
    public readonly issuanceId: string,
    public readonly dto: AddToWhitelistDto,
  ) {}
}

@CommandHandler(AddToWhitelistCommand)
export class AddToWhitelistHandler implements ICommandHandler<AddToWhitelistCommand, { walletAddress: string }> {
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(BLOCKCHAIN_GATEWAY) private readonly gateway: BlockchainGatewayPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddToWhitelistCommand): Promise<{ walletAddress: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(command.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${command.issuanceId}`);

    issuance.addToWhitelist(command.dto.walletAddress, command.dto.investorId);
    await this.gateway.addToWhitelist(issuance.id.value, command.dto.walletAddress);
    await this.issuances.save(issuance);
    await this.outbox.publish(issuance.pullEvents());
    return { walletAddress: command.dto.walletAddress };
  }
}
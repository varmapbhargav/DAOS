import { BlockchainGatewayPort, IssuanceId, MintRequestId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Issuance } from '../../domain/aggregates/issuance.aggregate';
import { MintRequest } from '../../domain/entities/mint-request.entity';
import {
  BLOCKCHAIN_GATEWAY,
  ISSUANCE_REPOSITORY,
  MINT_REQUEST_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { IssuanceRepository, MintRequestRepository } from '../../domain/repositories/issuance.repository';

export class ConfirmTokenMintCommand {
  constructor(
    public readonly issuanceId: string,
    public readonly mintRequestId: string,
  ) {}
}

@CommandHandler(ConfirmTokenMintCommand)
export class ConfirmTokenMintHandler
  implements ICommandHandler<ConfirmTokenMintCommand, { status: string; txHash: string }>
{
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(MINT_REQUEST_REPOSITORY) private readonly mintRequests: MintRequestRepository,
    @Inject(BLOCKCHAIN_GATEWAY) private readonly gateway: BlockchainGatewayPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ConfirmTokenMintCommand): Promise<{ status: string; txHash: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(command.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${command.issuanceId}`);

    const request = await this.mintRequests.findById(tenantId, MintRequestId.create(command.mintRequestId));
    if (!request) throw new NotFoundError(`Mint request not found: ${command.mintRequestId}`);

    const result = await this.gateway.mintTokens({
      issuanceId: issuance.id.value,
      amount: BigInt(request.amountMinorUnits),
      toAddress: request.toAddress,
      whitelist: issuance.whitelist.map((e) => e.walletAddress),
      network: issuance.network,
    });

    request.confirm(result.txHash);
    issuance.confirmMint(request.id.value, request.amountMinorUnits, result.txHash);
    issuance.openWhitelist();

    await this.mintRequests.save(request);
    await this.issuances.save(issuance);
    await this.outbox.publish([...issuance.pullEvents()]);
    return { status: issuance.status, txHash: result.txHash };
  }
}
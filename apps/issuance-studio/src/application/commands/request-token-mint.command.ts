import { IssuanceId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MintRequest } from '../../domain/entities/mint-request.entity';
import {
  ISSUANCE_REPOSITORY,
  MINT_REQUEST_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { IssuanceRepository, MintRequestRepository } from '../../domain/repositories/issuance.repository';
import { RequestMintDto } from '../dto/issuance-action.dto';

export class RequestTokenMintCommand {
  constructor(
    public readonly issuanceId: string,
    public readonly dto: RequestMintDto,
  ) {}
}

@CommandHandler(RequestTokenMintCommand)
export class RequestTokenMintHandler implements ICommandHandler<RequestTokenMintCommand, { mintRequestId: string }> {
  constructor(
    @Inject(ISSUANCE_REPOSITORY) private readonly issuances: IssuanceRepository,
    @Inject(MINT_REQUEST_REPOSITORY) private readonly mintRequests: MintRequestRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RequestTokenMintCommand): Promise<{ mintRequestId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const issuance = await this.issuances.findById(tenantId, IssuanceId.create(command.issuanceId));
    if (!issuance) throw new NotFoundError(`Issuance not found: ${command.issuanceId}`);

    const request = MintRequest.request({
      tenantId,
      issuanceId: issuance.id.value,
      amountMinorUnits: command.dto.amountMinorUnits,
      toAddress: command.dto.toAddress,
      requestedBy: TenantContextHolder.requireTenantId(),
    });

    await this.mintRequests.save(request);
    return { mintRequestId: request.id.value };
  }
}
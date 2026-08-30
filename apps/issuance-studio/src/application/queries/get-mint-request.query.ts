import { MintRequestId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { MINT_REQUEST_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MintRequestRepository } from '../../domain/repositories/issuance.repository';
import { MintRequestDto, toMintRequestDto } from '../issuance.mapper';

export class GetMintRequestQuery {
  constructor(public readonly mintRequestId: string) {}
}

@QueryHandler(GetMintRequestQuery)
export class GetMintRequestHandler implements IQueryHandler<GetMintRequestQuery, MintRequestDto> {
  constructor(@Inject(MINT_REQUEST_REPOSITORY) private readonly mintRequests: MintRequestRepository) {}

  async execute(query: GetMintRequestQuery): Promise<MintRequestDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const request = await this.mintRequests.findById(tenantId, MintRequestId.create(query.mintRequestId));
    if (!request) throw new NotFoundError(`Mint request not found: ${query.mintRequestId}`);
    return toMintRequestDto(request);
  }
}
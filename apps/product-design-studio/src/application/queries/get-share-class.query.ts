import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ShareClassId } from '@daos/shared-kernel';

import { SHARE_CLASS_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ShareClassRepository } from '../../domain/repositories/share-class.repository';
import { ShareClassDto, toShareClassDto } from '../product.mapper';

export class GetShareClassQuery {
  constructor(public readonly shareClassId: string) {}
}

@QueryHandler(GetShareClassQuery)
export class GetShareClassHandler implements IQueryHandler<GetShareClassQuery, ShareClassDto> {
  constructor(@Inject(SHARE_CLASS_REPOSITORY) private readonly shareClasses: ShareClassRepository) {}

  async execute(query: GetShareClassQuery): Promise<ShareClassDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const shareClass = await this.shareClasses.findById(tenantId, ShareClassId.create(query.shareClassId));
    if (!shareClass) throw new NotFoundError(`Share class not found: ${query.shareClassId}`);
    return toShareClassDto(shareClass);
  }
}

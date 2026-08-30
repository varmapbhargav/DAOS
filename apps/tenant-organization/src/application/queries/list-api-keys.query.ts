import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { API_KEY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { toApiKeyDto, ApiKeyDto } from '../organization.mapper';

export class ListApiKeysQuery {}

@QueryHandler(ListApiKeysQuery)
export class ListApiKeysHandler implements IQueryHandler<ListApiKeysQuery, ApiKeyDto[]> {
  constructor(@Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository) {}

  async execute(): Promise<ApiKeyDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const keys = await this.apiKeys.listByTenant(tenantId);
    return keys.map((key) => toApiKeyDto(key));
  }
}

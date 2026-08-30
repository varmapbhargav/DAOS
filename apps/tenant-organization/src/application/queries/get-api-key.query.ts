import { ApiKeyId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { API_KEY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { toApiKeyDto, ApiKeyDto } from '../organization.mapper';

export class GetApiKeyQuery {
  constructor(public readonly keyId: string) {}
}

@QueryHandler(GetApiKeyQuery)
export class GetApiKeyHandler implements IQueryHandler<GetApiKeyQuery, ApiKeyDto> {
  constructor(@Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository) {}

  async execute(query: GetApiKeyQuery): Promise<ApiKeyDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const apiKey = await this.apiKeys.findById(tenantId, ApiKeyId.create(query.keyId));
    if (!apiKey) throw new NotFoundError(`API key not found: ${query.keyId}`);
    return toApiKeyDto(apiKey);
  }
}

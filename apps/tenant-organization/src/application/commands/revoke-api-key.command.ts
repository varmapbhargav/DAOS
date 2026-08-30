import { NotFoundError, ApiKeyId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { API_KEY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

export class RevokeApiKeyCommand {
  constructor(public readonly keyId: string) {}
}

@CommandHandler(RevokeApiKeyCommand)
export class RevokeApiKeyHandler implements ICommandHandler<RevokeApiKeyCommand, { keyId: string }> {
  constructor(
    @Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RevokeApiKeyCommand): Promise<{ keyId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const apiKey = await this.apiKeys.findById(tenantId, ApiKeyId.create(command.keyId));
    if (!apiKey) throw new NotFoundError(`API key not found: ${command.keyId}`);
    apiKey.revoke();
    await this.apiKeys.save(apiKey);
    await this.outbox.publish(apiKey.pullEvents());
    return { keyId: apiKey.id.value };
  }
}

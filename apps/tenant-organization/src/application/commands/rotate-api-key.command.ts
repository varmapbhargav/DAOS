import { NotFoundError, ApiKeyId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { API_KEY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { ApiKeyService } from '../../domain/services/api-key.service';
import { IssueApiKeyResultDto } from '../dto/organization.dto';

export class RotateApiKeyCommand {
  constructor(public readonly keyId: string, public readonly ttlDays: number | null) {}
}

@CommandHandler(RotateApiKeyCommand)
export class RotateApiKeyHandler implements ICommandHandler<RotateApiKeyCommand, IssueApiKeyResultDto> {
  constructor(
    @Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly keyService: ApiKeyService,
  ) {}

  async execute(command: RotateApiKeyCommand): Promise<IssueApiKeyResultDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const apiKey = await this.apiKeys.findById(tenantId, ApiKeyId.create(command.keyId));
    if (!apiKey) throw new NotFoundError(`API key not found: ${command.keyId}`);
    const generated = this.keyService.generate(command.ttlDays ?? null);
    apiKey.rotate(generated.keyHash, generated.expiresAt);
    await this.apiKeys.save(apiKey);
    await this.outbox.publish(apiKey.pullEvents());
    return { keyId: apiKey.id.value, rawKey: generated.rawKey, expiresAt: generated.expiresAt };
  }
}

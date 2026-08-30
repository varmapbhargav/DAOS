import { ConflictError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApiKey } from '../../domain/aggregates/api-key.aggregate';
import { ApiKeyRepository } from '../../domain/repositories/api-key.repository';
import { API_KEY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { ApiKeyService } from '../../domain/services/api-key.service';
import { IssueApiKeyDto, IssueApiKeyResultDto } from '../dto/organization.dto';

export class IssueApiKeyCommand {
  constructor(public readonly dto: IssueApiKeyDto) {}
}

@CommandHandler(IssueApiKeyCommand)
export class IssueApiKeyHandler implements ICommandHandler<IssueApiKeyCommand, IssueApiKeyResultDto> {
  constructor(
    @Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly keyService: ApiKeyService,
  ) {}

  async execute(command: IssueApiKeyCommand): Promise<IssueApiKeyResultDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const existing = await this.apiKeys.findByLabel(tenantId, command.dto.label);
    if (existing) throw new ConflictError(`API key label already in use: ${command.dto.label}`);
    const generated = this.keyService.generate(command.dto.ttlDays ?? null);
    const apiKey = ApiKey.issue({
      tenantId,
      label: command.dto.label,
      scope: command.dto.scope,
      keyHash: generated.keyHash,
      prefix: generated.prefix,
      expiresAt: generated.expiresAt,
      createdAt: new Date().toISOString(),
    });
    await this.apiKeys.save(apiKey);
    await this.outbox.publish(apiKey.pullEvents());
    return { keyId: apiKey.id.value, rawKey: generated.rawKey, expiresAt: generated.expiresAt };
  }
}

import { LegalEntityId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';

export class ActivateEntityCommand {
  constructor(
    public readonly entityId: string,
    public readonly activatedBy: string,
  ) {}
}

@CommandHandler(ActivateEntityCommand)
export class ActivateEntityHandler implements ICommandHandler<ActivateEntityCommand, { status: string }> {
  constructor(
    @Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ActivateEntityCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(command.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${command.entityId}`);

    entity.activate(command.activatedBy);
    await this.entities.save(entity);
    await this.outbox.publish(entity.pullEvents());
    return { status: entity.status };
  }
}
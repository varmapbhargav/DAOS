import { EntityHierarchyNode, LegalEntityId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { UpdateHierarchyDto } from '../dto/entity-action.dto';

export class UpdateEntityHierarchyCommand {
  constructor(
    public readonly entityId: string,
    public readonly dto: UpdateHierarchyDto,
  ) {}
}

@CommandHandler(UpdateEntityHierarchyCommand)
export class UpdateEntityHierarchyHandler
  implements ICommandHandler<UpdateEntityHierarchyCommand, { relationType: string }>
{
  constructor(
    @Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateEntityHierarchyCommand): Promise<{ relationType: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(command.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${command.entityId}`);

    const node: EntityHierarchyNode = {
      parentEntityId: command.dto.parentEntityId ?? null,
      childEntityIds: command.dto.childEntityIds ?? [],
      relationType: command.dto.relationType,
    };
    entity.updateHierarchy(node);
    await this.entities.save(entity);
    await this.outbox.publish(entity.pullEvents());
    return { relationType: entity.hierarchy.relationType };
  }
}
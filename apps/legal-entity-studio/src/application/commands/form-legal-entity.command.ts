import { LegalFormationProvider, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LegalEntity } from '../../domain/aggregates/legal-entity.aggregate';
import {
  LEGAL_ENTITY_REPOSITORY,
  LEGAL_FORMATION_PROVIDER,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { FormLegalEntityDto } from '../dto/form-legal-entity.dto';

export class FormLegalEntityCommand {
  constructor(public readonly dto: FormLegalEntityDto) {}
}

@CommandHandler(FormLegalEntityCommand)
export class FormLegalEntityHandler implements ICommandHandler<FormLegalEntityCommand, { entityId: string }> {
  constructor(
    @Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository,
    @Inject(LEGAL_FORMATION_PROVIDER) private readonly formation: LegalFormationProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: FormLegalEntityCommand): Promise<{ entityId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const formed = await this.formation.formEntity({
      entityType: dto.entityType,
      jurisdiction: dto.jurisdiction,
    });

    const entity = LegalEntity.form({
      tenantId,
      legalName: dto.legalName,
      entityType: formed.type,
      jurisdiction: dto.jurisdiction,
      formationRef: formed.entityRef,
    });

    await this.entities.save(entity);
    await this.outbox.publish(entity.pullEvents());
    return { entityId: entity.id.value };
  }
}
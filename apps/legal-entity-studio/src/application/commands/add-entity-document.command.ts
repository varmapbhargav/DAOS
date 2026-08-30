import { ESignatureProvider, LegalEntityId, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CorporateDocument } from '../../domain/entities/corporate-document.aggregate';
import {
  CORPORATE_DOCUMENT_REPOSITORY,
  ESIGNATURE_PROVIDER,
  LEGAL_ENTITY_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { CorporateDocumentRepository } from '../../domain/repositories/corporate-document.repository';
import { AddEntityDocumentDto } from '../dto/entity-action.dto';

export class AddEntityDocumentCommand {
  constructor(
    public readonly entityId: string,
    public readonly dto: AddEntityDocumentDto,
  ) {}
}

@CommandHandler(AddEntityDocumentCommand)
export class AddEntityDocumentHandler
  implements ICommandHandler<AddEntityDocumentCommand, { documentId: string; envelopeRef: string }>
{
  constructor(
    @Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository,
    @Inject(CORPORATE_DOCUMENT_REPOSITORY) private readonly documents: CorporateDocumentRepository,
    @Inject(ESIGNATURE_PROVIDER) private readonly esign: ESignatureProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddEntityDocumentCommand): Promise<{ documentId: string; envelopeRef: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(command.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${command.entityId}`);

    const document = CorporateDocument.generate({
      tenantId,
      entityId: entity.id.value,
      docType: command.dto.docType,
      fileRef: command.dto.fileRef,
    });

    const envelope = await this.esign.sendForSignature({
      docType: document.docType,
      fileRef: document.fileRef,
      signatories: document.signatories,
    });

    entity.attachDocument(document);

    await this.documents.save(document);
    await this.entities.save(entity);
    await this.outbox.publish([...document.pullEvents(), ...entity.pullEvents()]);
    return { documentId: document.id.value, envelopeRef: envelope.envelopeRef };
  }
}
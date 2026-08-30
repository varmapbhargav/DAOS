import { DocumentCategory, DocumentStoragePort, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { DocumentId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';

import { DOCUMENT_REPOSITORY, DOCUMENT_STORAGE, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { AddDocumentVersionDto } from '../dto/add-document-version.dto';

export class AddDocumentVersionCommand {
  constructor(
    public readonly documentId: string,
    public readonly dto: AddDocumentVersionDto,
  ) {}
}

@CommandHandler(AddDocumentVersionCommand)
export class AddDocumentVersionHandler implements ICommandHandler<AddDocumentVersionCommand, { documentId: string; versionNumber: number }> {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStoragePort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddDocumentVersionCommand): Promise<{ documentId: string; versionNumber: number }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const document = await this.documents.findById(tenantId, DocumentId.create(command.documentId));
    if (!document) throw new NotFoundError(`Document not found: ${command.documentId}`);
    const bytes = command.dto.contentBase64 ? Buffer.from(command.dto.contentBase64, 'base64') : Buffer.alloc(0);
    const fileRef = `documents/${randomUUID()}`;
    const stored = await this.storage.upload({
      fileRef,
      bytes,
      contentType: command.dto.contentType,
      category: document.category as DocumentCategory,
    });
    const version = document.addVersion({
      fileRef,
      storageKey: stored.storageKey,
      checksum: stored.checksum,
      contentType: command.dto.contentType,
      sizeBytes: stored.sizeBytes,
      uploadedBy: TenantContextHolder.get().userId ?? 'system',
    });
    await this.documents.save(document);
    await this.outbox.publish(document.pullEvents());
    return { documentId: document.id.value, versionNumber: version.versionNumber };
  }
}
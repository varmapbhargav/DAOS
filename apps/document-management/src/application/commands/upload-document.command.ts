import { DocumentCategory, DocumentStoragePort, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';

import { Document } from '../../domain/aggregates/document.aggregate';
import { DOCUMENT_REPOSITORY, DOCUMENT_STORAGE, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { UploadDocumentDto } from '../dto/upload-document.dto';

export class UploadDocumentCommand {
  constructor(public readonly dto: UploadDocumentDto) {}
}

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand, { documentId: string; versionNumber: number }> {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStoragePort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<{ documentId: string; versionNumber: number }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const bytes = command.dto.contentBase64 ? Buffer.from(command.dto.contentBase64, 'base64') : Buffer.alloc(0);
    const fileRef = `documents/${randomUUID()}`;
    const stored = await this.storage.upload({
      fileRef,
      bytes,
      contentType: command.dto.contentType,
      category: command.dto.category as DocumentCategory,
    });
    const document = Document.upload({
      tenantId,
      fileName: command.dto.fileName,
      category: command.dto.category,
      entityRef: command.dto.entityRef,
      version: {
        fileRef,
        storageKey: stored.storageKey,
        checksum: stored.checksum,
        contentType: command.dto.contentType,
        sizeBytes: stored.sizeBytes,
        uploadedBy: TenantContextHolder.get().userId ?? 'system',
      },
    });
    await this.documents.save(document);
    await this.outbox.publish(document.pullEvents());
    return { documentId: document.id.value, versionNumber: document.currentVersionNumber };
  }
}
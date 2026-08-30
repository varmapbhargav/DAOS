import { DocumentId, DocumentStoragePort, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DOCUMENT_REPOSITORY, DOCUMENT_STORAGE } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';

export class GenerateDownloadUrlQuery {
  constructor(
    public readonly documentId: string,
    public readonly versionNumber: number,
    public readonly expiresInSeconds?: number,
  ) {}
}

export interface DownloadUrlResult {
  documentId: string;
  versionNumber: number;
  downloadUrl: string;
  expiresInSeconds: number;
}

@QueryHandler(GenerateDownloadUrlQuery)
export class GenerateDownloadUrlHandler implements IQueryHandler<GenerateDownloadUrlQuery, DownloadUrlResult> {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository,
    @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStoragePort,
  ) {}

  async execute(query: GenerateDownloadUrlQuery): Promise<DownloadUrlResult> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const document = await this.documents.findById(tenantId, DocumentId.create(query.documentId));
    if (!document) throw new NotFoundError(`Document not found: ${query.documentId}`);
    const version = document.getVersion(query.versionNumber);
    const expiresInSeconds = query.expiresInSeconds ?? 3600;
    const downloadUrl = await this.storage.getDownloadUrl(version.storageKey, expiresInSeconds);
    return { documentId: document.id.value, versionNumber: version.versionNumber, downloadUrl, expiresInSeconds };
  }
}
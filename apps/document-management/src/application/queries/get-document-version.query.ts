import { DocumentId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DOCUMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentVersionDto, toDocumentVersionDto } from '../document.mapper';

export class GetDocumentVersionQuery {
  constructor(
    public readonly documentId: string,
    public readonly versionNumber: number,
  ) {}
}

@QueryHandler(GetDocumentVersionQuery)
export class GetDocumentVersionHandler implements IQueryHandler<GetDocumentVersionQuery, DocumentVersionDto> {
  constructor(@Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository) {}

  async execute(query: GetDocumentVersionQuery): Promise<DocumentVersionDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const document = await this.documents.findById(tenantId, DocumentId.create(query.documentId));
    if (!document) throw new NotFoundError(`Document not found: ${query.documentId}`);
    const version = document.getVersion(query.versionNumber);
    return toDocumentVersionDto(version);
  }
}
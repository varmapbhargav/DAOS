import { DocumentId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DOCUMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentDto, toDocumentDto } from '../document.mapper';

export class GetDocumentQuery {
  constructor(public readonly documentId: string) {}
}

@QueryHandler(GetDocumentQuery)
export class GetDocumentHandler implements IQueryHandler<GetDocumentQuery, DocumentDto> {
  constructor(@Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository) {}

  async execute(query: GetDocumentQuery): Promise<DocumentDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const document = await this.documents.findById(tenantId, DocumentId.create(query.documentId));
    if (!document) throw new NotFoundError(`Document not found: ${query.documentId}`);
    return toDocumentDto(document);
  }
}
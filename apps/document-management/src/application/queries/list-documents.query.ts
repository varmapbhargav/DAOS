import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DOCUMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentDto, toDocumentDto } from '../document.mapper';

export class ListDocumentsQuery {}

@QueryHandler(ListDocumentsQuery)
export class ListDocumentsHandler implements IQueryHandler<ListDocumentsQuery, DocumentDto[]> {
  constructor(@Inject(DOCUMENT_REPOSITORY) private readonly documents: DocumentRepository) {}

  async execute(): Promise<DocumentDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const documents = await this.documents.findAll(tenantId);
    return documents.map(toDocumentDto);
  }
}
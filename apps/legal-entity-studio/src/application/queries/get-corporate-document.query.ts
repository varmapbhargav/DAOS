import { CorporateDocumentId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CORPORATE_DOCUMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CorporateDocumentRepository } from '../../domain/repositories/corporate-document.repository';
import { CorporateDocumentDto, toCorporateDocumentDto } from '../legal-entity.mapper';

export class GetCorporateDocumentQuery {
  constructor(public readonly documentId: string) {}
}

@QueryHandler(GetCorporateDocumentQuery)
export class GetCorporateDocumentHandler implements IQueryHandler<GetCorporateDocumentQuery, CorporateDocumentDto> {
  constructor(@Inject(CORPORATE_DOCUMENT_REPOSITORY) private readonly documents: CorporateDocumentRepository) {}

  async execute(query: GetCorporateDocumentQuery): Promise<CorporateDocumentDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const document = await this.documents.findById(tenantId, CorporateDocumentId.create(query.documentId));
    if (!document) throw new NotFoundError(`Corporate document not found: ${query.documentId}`);
    return toCorporateDocumentDto(document);
  }
}
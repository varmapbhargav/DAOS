import {
  BeneficialOwnerRecord,
  CorporateDocType,
  EntityHierarchyNode,
  EntityStatus,
  EntityType,
  RegisteredAgent,
  SignatureStatus,
  Signatory,
} from '@daos/shared-kernel';

import { LegalEntity } from '../domain/aggregates/legal-entity.aggregate';
import { CorporateDocument } from '../domain/entities/corporate-document.aggregate';

export interface LegalEntityDto {
  id: string;
  tenantId: string;
  legalName: string;
  entityType: EntityType;
  jurisdiction: string;
  status: EntityStatus;
  registeredAgent: RegisteredAgent | null;
  beneficialOwners: BeneficialOwnerRecord[];
  hierarchy: EntityHierarchyNode;
  documentIds: string[];
  formationRef: string | null;
  version: number;
}

export interface CorporateDocumentDto {
  id: string;
  tenantId: string;
  entityId: string;
  docType: CorporateDocType;
  fileRef: string;
  status: SignatureStatus;
  signatories: Signatory[];
  createdAt: string;
  version: number;
}

export function toLegalEntityDto(entity: LegalEntity): LegalEntityDto {
  return {
    id: entity.id.value,
    tenantId: entity.tenantId.value,
    legalName: entity.legalName,
    entityType: entity.entityType,
    jurisdiction: entity.jurisdiction,
    status: entity.status,
    registeredAgent: entity.registeredAgent,
    beneficialOwners: entity.beneficialOwners,
    hierarchy: entity.hierarchy,
    documentIds: entity.documentIds,
    formationRef: entity.formationRef,
    version: entity.version,
  };
}

export function toCorporateDocumentDto(document: CorporateDocument): CorporateDocumentDto {
  return {
    id: document.id.value,
    tenantId: document.tenantId.value,
    entityId: document.entityId,
    docType: document.docType,
    fileRef: document.fileRef,
    status: document.status,
    signatories: document.signatories,
    createdAt: document.createdAt,
    version: document.version,
  };
}
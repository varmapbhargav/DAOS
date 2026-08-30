// Legal Entity Structuring infrastructure ports.
// External-provider ports used by the legal-entity-studio bounded context.
import { CorporateDocType, EntityType, Signatory } from '../value-objects/entity-value-objects';

export interface LegalFormationProvider {
  formEntity(params: { entityType: EntityType; jurisdiction: string }): Promise<{ entityRef: string; type: EntityType }>;
}

export interface ESignatureProvider {
  sendForSignature(params: {
    docType: CorporateDocType;
    fileRef: string;
    signatories: Signatory[];
  }): Promise<{ envelopeRef: string; status: string }>;
  getSignatureStatus(envelopeRef: string): Promise<{ status: string; signatories: Signatory[] }>;
}

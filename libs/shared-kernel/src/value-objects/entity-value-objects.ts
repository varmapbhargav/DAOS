// Legal Entity Structuring Value Objects
export type EntityType =
  | 'delawareLLC'
  | 'delawareCorpC'
  | 'caymanSPV'
  | 'caymanLP'
  | 'luxSOPARFI'
  | 'sgVCC'
  | 'irishQIAIF'
  | 'bermudaLP';

export type EntityStatus = 'forming' | 'active' | 'dissolved' | 'suspended';

export type EntityHierarchyNode = {
  parentEntityId: string | null;
  childEntityIds: string[];
  relationType: string;
};

export type RegisteredAgent = {
  agencyName: string;
  agentRef: string;
  jurisdiction: string;
  goodStandingDate: string;
};

export type BeneficialOwnerRecord = {
  name: string;
  ownershipPct: number;
  isControlParty: boolean;
};

export type EntityDocument = {
  docType: string;
  fileRef: string;
  version: number;
  signedAt: string | null;
};

export type SignatureStatus = 'pending' | 'partiallyExecuted' | 'fullyExecuted';

export type Signatory = {
  userId: string;
  role: string;
  signedAt: string | null;
};

export type CorporateDocType =
  | 'operatingAgreement'
  | 'subscriptionAgreement'
  | 'ppm'
  | 'lpAgreement'
  | 'certOfFormation'
  | 'registerOfMembers';

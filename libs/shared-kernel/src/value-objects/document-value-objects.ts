// Document Management Value Objects
export type DocumentCategory =
  | 'legalAgreement'
  | 'subscriptionDocument'
  | 'offeringMemorandum'
  | 'financialStatement'
  | 'corporateRecord'
  | 'regulatoryFiling'
  | 'governance'
  | 'other';

export type DocumentStatus = 'uploaded' | 'archived';

export type EntityReference = {
  entityType: string;
  entityId: string;
};

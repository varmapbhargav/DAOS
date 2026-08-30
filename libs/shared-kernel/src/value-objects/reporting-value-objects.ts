// Reporting Value Objects
export type NavStatus = 'preliminary' | 'validated' | 'final' | 'restated';

export type StatementStatus = 'draft' | 'distributed' | 'acknowledged';

export type DocumentCategory = 'legalAgreement' | 'financialStatement' | 'compliance' | 'marketing' | 'KYC' | 'taxDocument' | 'other';

export type EntityReference = {
  entityType: string;
  entityId: string;
};

export type DocumentStatus = 'active' | 'archived' | 'superseded';

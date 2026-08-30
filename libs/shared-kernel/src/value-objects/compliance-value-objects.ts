// Compliance & Regulatory Value Objects
export type ComplianceRuleType =
  | 'reg506b'
  | 'reg506c'
  | 'regS'
  | 'regA'
  | 'regD'
  | 'bluesky'
  | 'AIFMD'
  | 'formPF'
  | 'FATCA'
  | 'CRS'
  | 'insiderTrading'
  | 'beneficialOwnership';

export type FilingType =
  | 'formD'
  | 'blueSkyNotice'
  | 'formPF'
  | 'formADV'
  | 'annualReport'
  | 'quarterlyReport';

export type FilingStatus = 'draft' | 'inReview' | 'submitted' | 'accepted' | 'rejected';

export type FilingPeriod = {
  startDate: string;
  endDate: string;
};

export type ReportingPeriod = {
  startDate: string;
  endDate: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
};

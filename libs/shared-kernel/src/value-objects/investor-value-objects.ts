// Investor Management Value Objects
import { Money, UtcInstant } from '@daos/shared-kernel';

export type InvestorProfile = {
  legalName: string;
  dateOfBirth: Date;
  nationality: string;
  taxId: string;
};

export type AccreditationLevel =
  | 'accreditedInvestor'
  | 'qualifiedPurchaser'
  | 'qualifiedClient'
  | 'regS'
  | 'regA'
  | 'reg506b'
  | 'reg506c';

export type AccreditationStatus = 'pending' | 'verified' | 'expired' | 'rejected';

export type KycStatus = 'notStarted' | 'submitted' | 'underReview' | 'approved' | 'rejected';

export type RiskProfile = {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentHorizon: number; // months
  liquidityNeeds: 'low' | 'medium' | 'high';
};

export type KycDocument = {
  documentType: string;
  fileRef: string;
  checksum: string;
  uploadedAt: UtcInstant;
};

export type InvestorStatus = 'invited' | 'active' | 'disabled';

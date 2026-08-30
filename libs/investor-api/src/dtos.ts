export interface InvestorProfileDto {
  legalName: string;
  dateOfBirth: string;
  nationality: string;
  taxId: string;
}

export interface InvestorDto {
  id: string;
  tenantId: string;
  userId: string | null;
  email: string;
  status: string;
  profile: InvestorProfileDto;
  accreditationLevel: string | null;
  accreditationStatus: string;
  riskProfile: RiskProfileDto | null;
  walletAddresses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskProfileDto {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentHorizon: number;
  liquidityNeeds: 'low' | 'medium' | 'high';
}

export interface KycDocumentDto {
  documentType: string;
  fileRef: string;
  checksum: string;
  uploadedAt: string;
}

export interface KycProfileDto {
  id: string;
  investorId: string;
  tenantId: string;
  status: string;
  providerRef: string | null;
  documents: KycDocumentDto[];
  submittedAt: string | null;
  reviewedAt: string | null;
  report: KycReportDto | null;
}

export interface KycReportDto {
  passed: boolean;
  score: number;
  documentResults: Record<string, unknown>;
  recommendations: string[];
}

export interface EligibilityResultDto {
  investorId: string;
  kycApproved: boolean;
  accredited: boolean;
  eligible: boolean;
  accreditationStatus: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Counterparty
// ---------------------------------------------------------------------------

export class CreateCounterpartyDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({ enum: ['ENTITY', 'PERSON'] })
  @IsEnum(['ENTITY', 'PERSON'])
  counterpartyType!: 'ENTITY' | 'PERSON';

  @ApiProperty({ enum: ['OWNER', 'BENEFICIAL_OWNER', 'SELLER', 'BUYER', 'BORROWER', 'LENDER', 'ISSUER', 'SPONSOR', 'OPERATOR', 'SERVICER', 'CUSTODIAN', 'TRUSTEE', 'ADMINISTRATOR', 'MANAGER', 'VALUER', 'AUDITOR', 'LEGAL_ADVISOR', 'BROKER', 'ORIGINATOR', 'INSURER', 'REGULATOR', 'SECURITY_HOLDER'] })
  @IsString()
  role!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  economicRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ownershipPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;
}

export class VerifyCounterpartyDto {
  @ApiProperty({ enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'] })
  @IsString()
  status!: string;
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export class CreateOwnershipDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  personId?: string;

  @ApiProperty({ enum: ['LEGAL', 'ECONOMIC', 'BENEFICIAL', 'CONTROL', 'NOMINEE', 'TRUST'] })
  @IsString()
  ownershipType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ownershipPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  economicInterestPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  controlPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  acquisitionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyOwnershipDto {
  @ApiProperty({ enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'] })
  @IsString()
  status!: string;
}

// ---------------------------------------------------------------------------
// Rights
// ---------------------------------------------------------------------------

export class CreateRightsDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ enum: ['OWNERSHIP', 'BENEFICIAL_INTEREST', 'REVENUE_RIGHT', 'INCOME_RIGHT', 'DEBT_CLAIM', 'SECURITY_INTEREST', 'VOTING_RIGHT', 'REDEMPTION_RIGHT', 'ROYALTY_RIGHT', 'LEASE_RIGHT', 'PROFIT_PARTICIPATION', 'GOVERNANCE_RIGHT'] })
  @IsString()
  rightType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  holderEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  holderPersonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  transferable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  assignable?: boolean;
}

// ---------------------------------------------------------------------------
// Encumbrance
// ---------------------------------------------------------------------------

export class CreateEncumbranceDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ enum: ['MORTGAGE', 'LIEN', 'PLEDGE', 'CHARGE', 'SECURITY_INTEREST', 'DEBT', 'CLAIM', 'LITIGATION_CLAIM', 'TRANSFER_RESTRICTION'] })
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  holderEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountMinorUnits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  releaseConditions?: string;
}

// ---------------------------------------------------------------------------
// Transferability
// ---------------------------------------------------------------------------

export class CreateTransferabilityDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  transferable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  assignable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fractionalizable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tokenizable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  beneficialInterestTransferable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  issuerConsentRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ownerConsentRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  regulatorApprovalRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geographicRestrictions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  investorRestrictions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lockupDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  preEmptionRights?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  legalOpinionRequired?: boolean;
}

export class CompleteTransferabilityAssessmentDto {
  @ApiProperty()
  @IsString()
  reviewer!: string;

  @ApiProperty({ enum: ['TRANSFERABLE', 'TRANSFERABLE_WITH_CONDITIONS', 'NOT_TRANSFERABLE'] })
  @IsEnum(['TRANSFERABLE', 'TRANSFERABLE_WITH_CONDITIONS', 'NOT_TRANSFERABLE'])
  decision!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export class CreateProvenanceEventDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ enum: ['CREATED', 'ACQUIRED', 'TRANSFERRED', 'ASSIGNED', 'PLEDGED', 'RELEASED', 'VALUED', 'RESTRUCTURED', 'SPLIT', 'MERGED', 'TOKENIZED', 'REDEEMED', 'RETIRED'] })
  @IsString()
  eventType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  effectiveDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registryReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hash?: string;
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export class CreateEvidenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({ enum: ['REGISTRY_RECORD', 'BLOCKCHAIN_TRANSACTION', 'API_RESPONSE', 'CUSTODIAN_CONFIRMATION', 'BANK_STATEMENT', 'LEGAL_OPINION', 'EXTERNAL_DATABASE', 'VALUATION_REPORT', 'COUNTERPARTY_ATTESTATION', 'ORACLE_DATA', 'PHOTOGRAPH', 'INSPECTION_REPORT', 'CERTIFICATE'] })
  @IsString()
  evidenceType!: string;

  @ApiProperty()
  @IsString()
  source!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  evidenceDate?: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  collectedBy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessPolicy?: string;
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export class CreateClaimDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 'ABC SPV legally owns the asset.' })
  @IsString()
  claimStatement!: string;

  @ApiProperty({ enum: ['FACT', 'LEGAL', 'COMPLIANCE', 'OPERATIONAL', 'VERIFICATION'] })
  @IsString()
  claimType!: string;

  @ApiProperty()
  @IsString()
  claimOwner!: string;

  @ApiProperty({ enum: ['HIGH', 'MEDIUM', 'LOW'] })
  @IsEnum(['HIGH', 'MEDIUM', 'LOW'])
  materiality!: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class VerifyClaimDto {
  @ApiProperty()
  @IsString()
  verifier!: string;

  @ApiProperty({ enum: ['MANUAL', 'DOCUMENT_REVIEW', 'REGISTRY_SEARCH', 'API', 'ORACLE', 'AI_ASSISTED', 'LEGAL_OPINION'] })
  @IsString()
  method!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidence?: number;
}

export class RejectClaimDto {
  @ApiProperty()
  @IsString()
  reviewer!: string;

  @ApiProperty()
  @IsString()
  reason!: string;
}

// ---------------------------------------------------------------------------
// Data Requests
// ---------------------------------------------------------------------------

export class CreateDataRequestDto {
  @ApiProperty({ example: 'case-uuid' })
  @IsString()
  caseId!: string;

  @ApiProperty()
  @IsString()
  requestedFrom!: string;

  @ApiProperty()
  @IsString()
  requestedBy!: string;

  @ApiProperty({ enum: ['DOCUMENT', 'INFORMATION', 'CLARIFICATION', 'EVIDENCE', 'DECLARATION'] })
  @IsString()
  requestType!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  requiredBy?: string;
}

export class RespondToDataRequestDto {
  @ApiProperty()
  @IsString()
  response!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceReferences?: string[];
}

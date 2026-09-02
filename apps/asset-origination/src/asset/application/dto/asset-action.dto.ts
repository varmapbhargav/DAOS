import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitDueDiligenceDto {
  @ApiPropertyOptional({ example: 'Noted during financial review' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CompleteDueDiligenceDto {
  @ApiProperty({ enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'] })
  @IsEnum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'])
  rating!: string;

  @ApiProperty({ example: 'analyst-uuid' })
  @IsString()
  completedBy!: string;

  @ApiPropertyOptional({ example: 'Satisfactory operational and financial review' })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class CompleteRiskReviewDto {
  @ApiProperty({ enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'] })
  @IsEnum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'])
  rating!: string;

  @ApiPropertyOptional({ example: 'Risk assessment completed' })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class CompleteValuationDto {
  @ApiProperty({ example: 1350000000 })
  @IsNumber()
  fairValueMinorUnits!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ enum: ['dcf', 'comps', 'nav', 'costApproach', 'incomeApproach'] })
  @IsEnum(['dcf', 'comps', 'nav', 'costApproach', 'incomeApproach'])
  methodology!: string;
}

export class UpdateValuationDto {
  @ApiProperty({ example: 1350000000 })
  @IsNumber()
  fairValueMinorUnits!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ enum: ['dcf', 'comps', 'nav', 'costApproach', 'incomeApproach'] })
  @IsEnum(['dcf', 'comps', 'nav', 'costApproach', 'incomeApproach'])
  methodology!: string;
}

export class CreateAssetDraftDto {
  @ApiProperty({ example: 'Aurora Logistics Portfolio' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'] })
  @IsEnum(['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'])
  assetClass!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  purchasePriceMinorUnits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchasePriceCurrency?: string;

  @ApiPropertyOptional({ type: 'array' })
  @IsOptional()
  collateral?: Array<{
    type: string;
    description: string;
    estimatedValueMinorUnits?: number;
    lienPosition?: number;
  }>;

  @ApiPropertyOptional({ type: 'array' })
  @IsOptional()
  provenance?: Array<{
    sourceType: string;
    sourceRef: string;
    documentedAt: string;
    priorOwners?: string[];
  }>;
}

export class HandoffToDealStudioDto {
  @ApiPropertyOptional({ example: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PutAssetOnHoldDto {
  @ApiProperty({ example: 'Waiting for partner approval' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class ResumeAssetDto {
  @ApiPropertyOptional({ enum: ['DUE_DILIGENCE', 'VALUATION', 'RISK_REVIEW'] })
  @IsOptional()
  @IsEnum(['DUE_DILIGENCE', 'VALUATION', 'RISK_REVIEW'])
  targetStatus?: 'DUE_DILIGENCE' | 'VALUATION' | 'RISK_REVIEW';
}

export class WithdrawAssetDto {
  @ApiProperty({ example: 'Sponsor decided to withdraw' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class RejectAssetDto {
  @ApiProperty({ example: 'Fails credit criteria' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class ApproveAssetDto {
  @ApiProperty({ example: 'analyst-uuid' })
  @IsString()
  approvedBy!: string;
}

export class StartScreeningDto {
  @ApiProperty({ example: 'Start screening process for the asset' })
  @IsString()
  action!: string;

  @ApiPropertyOptional({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'] })
  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'])
  preDecision?: string;
}

export class CompleteScreeningDto {
  @ApiProperty({ example: 'All eligibility criteria passed' })
  @IsString()
  comments!: string;

  @ApiPropertyOptional({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'] })
  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'])
  decision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  criteriaResults?: Record<string, string>;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxScore?: number;
}

export class StartDueDiligenceDto {
  @ApiPropertyOptional({ example: 'Analyst initiating due diligence' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class QualifyAssetDto {
  @ApiPropertyOptional({ example: 'Analyst' })
  @IsOptional()
  @IsString()
  qualifiedBy?: string;
}

export class StartValuationDto {
  @ApiPropertyOptional({ example: 'Analystu' })
  @IsOptional()
  @IsString()
  requestedBy?: string;
}

export class StartRiskReviewDto {
  @ApiPropertyOptional({ example: 'Analyst' })
  @IsOptional()
  @IsString()
  requestedBy?: string;
}

export class SubmitForApprovalDto {
  @ApiPropertyOptional({ example: 'Analyst' })
  @IsOptional()
  @IsString()
  submittedBy?: string;
}

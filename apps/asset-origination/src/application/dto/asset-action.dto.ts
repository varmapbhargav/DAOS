import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

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

export class CreateAssetDraftDto {
  @ApiProperty({ example: 'Aurora Logistics Portfolio' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'] })
  @IsEnum(['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'])
  assetClass!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];
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

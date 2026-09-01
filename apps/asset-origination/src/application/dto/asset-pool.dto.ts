import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

// ---------------------------------------------------------------------------
// Asset Pooling
// ---------------------------------------------------------------------------

export class CreateAssetPoolDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['REVOLVING', 'STATIC', 'DYNAMIC', 'WAREHOUSE', 'SECURITIZATION', 'FUND'] })
  @IsEnum(['REVOLVING', 'STATIC', 'DYNAMIC', 'WAREHOUSE', 'SECURITIZATION', 'FUND'])
  poolType!: string;

  @ApiProperty({ enum: ['DIVERSIFIED', 'SECTOR_FOCUSED', 'GEOGRAPHIC_FOCUSED', 'ASSET_CLASS_FOCUSED', 'YIELD_OPTIMIZED', 'RISK_BALANCED'] })
  @IsEnum(['DIVERSIFIED', 'SECTOR_FOCUSED', 'GEOGRAPHIC_FOCUSED', 'ASSET_CLASS_FOCUSED', 'YIELD_OPTIMIZED', 'RISK_BALANCED'])
  strategy!: string;

  @ApiProperty({ enum: ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'] })
  @IsEnum(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'])
  currency!: string;

  @ApiPropertyOptional()
  @IsOptional()
  eligibilityPolicy?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  concentrationRules?: Array<{
    type: string;
    limit: number;
    scope?: string;
  }>;
}

export class UpdateAssetPoolDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddAssetToPoolDto {
  @ApiProperty()
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  allocationPercentage!: number;
}

export class UpdateAssetAllocationDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  allocationPercentage!: number;
}

export class RemoveAssetFromPoolDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RebalancePoolDto {
  @ApiProperty({ type: 'object' })
  targetAllocations!: Record<string, number>;
}

export class SplitPoolDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  newPoolIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  criteria?: Record<string, unknown>;
}

export class MergePoolsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  sourcePoolIds!: string[];
}

export class UpdateConcentrationRulesDto {
  @ApiProperty({ type: [Object] })
  @IsArray()
  rules!: Array<{
    type: string;
    limit: number;
    scope?: string;
  }>;
}

export class UpdateEligibilityPolicyDto {
  @ApiProperty()
  policy!: Record<string, unknown>;
}

export class CheckEligibilityDto {
  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiProperty()
  @IsString()
  assetClass!: string;

  @ApiProperty()
  @IsString()
  jurisdiction!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creditRating?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ltv?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  seasoningMonths?: number;
}

export class ChangePoolStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'CLOSED', 'LIQUIDATING'] })
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CLOSED', 'LIQUIDATING'])
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SetParentPoolDto {
  @ApiProperty()
  @IsString()
  parentPoolId!: string;
}
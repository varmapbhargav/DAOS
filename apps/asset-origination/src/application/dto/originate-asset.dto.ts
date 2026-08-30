import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CollateralDto {
  @ApiProperty({ example: 'realEstate' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 'First-lien commercial mortgage' })
  @IsString()
  description!: string;

  @ApiProperty({ example: { amountMinorUnits: '1200000000', currency: 'USD' } })
  @IsNumber()
  @IsOptional()
  estimatedValueMinorUnits?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  lienPosition!: number;
}

export class ProvenanceRecordDto {
  @ApiProperty({ enum: ['sponsor', 'broker', 'portfolio', 'inbound'] })
  @IsEnum(['sponsor', 'broker', 'portfolio', 'inbound'])
  sourceType!: string;

  @ApiProperty({ example: 'sponsor-batch-42' })
  @IsString()
  sourceRef!: string;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  @IsISO8601()
  documentedAt!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorOwners?: string[];
}

export class OriginateAssetDto {
  @ApiProperty({ example: 'Aurora Logistics Portfolio' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'] })
  @IsEnum(['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'])
  assetClass!: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets', 'realEstate/residential', 'realEstate/commercial', 'privateCredit/corporateLoan', 'privateCredit/assetBackedLoan', 'privateCredit/realEstateLoan', 'privateCredit/tradeFinance', 'privateCredit/receivablesFinancing', 'infrastructure/energy', 'infrastructure/transport', 'infrastructure/telecom', 'infrastructure/utilities', 'infrastructure/digitalInfrastructure', 'privateEquity/buyout', 'privateEquity/growth', 'privateEquity/venture', 'privateEquity/secondary'] })
  @IsEnum(['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets', 'realEstate/residential', 'realEstate/commercial', 'privateCredit/corporateLoan', 'privateCredit/assetBackedLoan', 'privateCredit/realEstateLoan', 'privateCredit/tradeFinance', 'privateCredit/receivablesFinancing', 'infrastructure/energy', 'infrastructure/transport', 'infrastructure/telecom', 'infrastructure/utilities', 'infrastructure/digitalInfrastructure', 'privateEquity/buyout', 'privateEquity/growth', 'privateEquity/venture', 'privateEquity/secondary'])
  assetSubClass!: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiProperty({ example: 'Aurora Logistics Corp' })
  @IsString()
  legalName!: string;

  @ApiPropertyOptional({ example: 'EXT-REF-12345' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({ example: 'INT-REF-67890' })
  @IsOptional()
  @IsString()
  internalReference?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional({ example: 1500000000 })
  @IsOptional()
  @IsNumber()
  purchasePriceMinorUnits?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  purchasePriceCurrency?: string;

  @ApiPropertyOptional({ type: [CollateralDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CollateralDto)
  collateral?: CollateralDto[];

  @ApiPropertyOptional({ type: [ProvenanceRecordDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProvenanceRecordDto)
  provenance?: ProvenanceRecordDto[];
}

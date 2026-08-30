import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class DealMetadataDto {
  @ApiProperty({ example: 'DEAL-2026-001' })
  @IsString()
  referenceNumber!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  internalReference?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  externalReference?: string;

  @ApiProperty({ example: 'ACQUISITION' })
  @IsEnum([
    'ACQUISITION','FINANCING','REFINANCING','RESTRUCTURING',
    'CO_INVESTMENT','FUND_INVESTMENT','ASSET_BACKED_FINANCING',
    'PRIVATE_CREDIT','REAL_ESTATE_INVESTMENT','TRADE_FINANCE','SECONDARY_TRANSACTION',
  ])
  dealType!: string;

  @ApiProperty({ example: 'REAL_ESTATE' })
  @IsString()
  assetClass!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  jurisdiction!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional() @IsISO8601()
  targetCloseDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  dealOwnerId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  dealTeamIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'ORIGINATION_OS' })
  @IsEnum(['INBOUND','OUTBOUND','REFERRAL','PLATFORM','ORIGINATION_OS'])
  source!: string;

  @ApiProperty({ example: 'HIGH' })
  @IsEnum(['LOW','MEDIUM','HIGH','CRITICAL'])
  priority!: string;
}

export class CreateDealDto {
  @ApiProperty({ example: 'Aurora Credit Facility' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiPropertyOptional({ type: DealMetadataDto })
  @IsOptional() @ValidateNested() @Type(() => DealMetadataDto)
  metadata?: DealMetadataDto;

  @ApiPropertyOptional() @IsOptional() @IsString()
  opportunityId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  idempotencyKey?: string;
}

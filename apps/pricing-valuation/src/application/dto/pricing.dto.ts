import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class MoneyDto {
  @ApiProperty({ example: '98750000', description: 'Integer minor units' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Invalid ISO currency' })
  currency!: string;
}

export class PublishPriceDto {
  @ApiProperty({ example: 'US0378331005' })
  @IsString()
  @IsNotEmpty()
  isin!: string;

  @ApiProperty({ example: '1000000', description: 'Integer minor units' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ enum: ['marketFeed', 'vendorApi', 'modelBased', 'manual', 'nav'] })
  @IsString()
  source!: string;

  @ApiProperty({ enum: ['level1', 'level2', 'level3'] })
  @IsString()
  fairValueHierarchy!: string;

  @ApiProperty({ example: '2026-08-30' })
  @IsString()
  @IsNotEmpty()
  marketDate!: string;
}

export class RunValuationDto {
  @ApiProperty({ example: 'asset-123' })
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @ApiProperty({ enum: ['DCF', 'comparables', 'NAV', 'costApproach', 'incomeApproach', 'AVM'] })
  @IsString()
  methodology!: string;

  @ApiPropertyOptional({ example: 'report-456' })
  @IsOptional()
  @IsString()
  reportId?: string;

  @ApiPropertyOptional({ type: MoneyDto })
  @IsOptional()
  value?: MoneyDto;
}

export class DetectDiscrepancyDto {
  @ApiProperty({ type: MoneyDto })
  comparatorValue!: MoneyDto;
}

export class RejectValuationDto {
  @ApiProperty({ example: 'Insufficient supporting evidence' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

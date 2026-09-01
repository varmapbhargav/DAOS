import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestValuationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valuer?: string;

  @ApiPropertyOptional({ enum: ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'] })
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'])
  currency?: string;
}

export class AssignValuerDto {
  @ApiProperty()
  @IsString()
  valuer!: string;
}

export class UploadValuationDto {
  @ApiPropertyOptional({ example: 1250000.0 })
  @IsOptional()
  @IsNumber()
  currentMarketValue?: number;

  @ApiPropertyOptional({ example: 1200000.0 })
  @IsOptional()
  @IsNumber()
  fairValue?: number;

  @ApiPropertyOptional({ example: 1100000.0 })
  @IsOptional()
  @IsNumber()
  bookValue?: number;

  @ApiPropertyOptional({ example: 1150000.0 })
  @IsOptional()
  @IsNumber()
  nav?: number;

  @ApiPropertyOptional({ example: 1000000.0 })
  @IsOptional()
  @IsNumber()
  faceValue?: number;

  @ApiPropertyOptional({ example: 950000.0 })
  @IsOptional()
  @IsNumber()
  outstandingPrincipal?: number;

  @ApiPropertyOptional({ example: 1300000.0 })
  @IsOptional()
  @IsNumber()
  indicativeAcquisitionValue?: number;

  @ApiPropertyOptional({ example: 1225000.0 })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valuationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valuationSource?: string;

  @ApiPropertyOptional({ enum: [
    'MARKET_COMPARABLES',
    'INCOME_APPROACH',
    'COST_APPROACH',
    'DISCOUNTED_CASH_FLOW',
    'PRECEDENT_TRANSACTIONS',
    'APPRaisal',
    'BROKER_OPINION',
    'OTHER',
  ] })
  @IsOptional()
  @IsEnum([
    'MARKET_COMPARABLES',
    'INCOME_APPROACH',
    'COST_APPROACH',
    'DISCOUNTED_CASH_FLOW',
    'PRECEDENT_TRANSACTIONS',
    'APPRaisal',
    'BROKER_OPINION',
    'OTHER',
  ])
  methodology?: string;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiPropertyOptional({ enum: ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'] })
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SGD', 'HKD'])
  currency?: string;
}

export class ReviewValuationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class RevalueDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valuer?: string;
}
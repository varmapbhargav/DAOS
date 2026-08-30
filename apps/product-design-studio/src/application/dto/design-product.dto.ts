import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ConcentrationLimitDto {
  @ApiProperty({ example: 'singleInvestor' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  threshold!: number;
}

export class ProductStrategyDto {
  @ApiProperty({ example: 'Long-biased growth' })
  @IsString()
  investmentObjective!: string;

  @ApiProperty({ type: [String], example: ['privateCredit'] })
  @IsArray()
  @IsString({ each: true })
  assetClasses!: string[];

  @ApiProperty({ type: [String], example: ['US'] })
  @IsArray()
  @IsString({ each: true })
  geographies!: string[];

  @ApiPropertyOptional({ type: [ConcentrationLimitDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConcentrationLimitDto)
  concentrationLimits?: ConcentrationLimitDto[];
}

export class LiquidityTermsDto {
  @ApiProperty({ example: 'quarterly' })
  @IsString()
  redemptionFrequency!: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  lockUpMonths!: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  noticeperiodDays!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  gating!: number;
}

export class FeeStructureDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  managementFeeAnnual!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  performanceFee!: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  hurdleRate!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  highWaterMark!: boolean;

  @ApiProperty({ example: 10 })
  @IsNumber()
  catchUpPercentage!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  catchUpRate!: number;
}

export class BenchmarkDto {
  @ApiProperty({ example: 'Bloomberg US Agg' })
  @IsString()
  benchmarkName!: string;

  @ApiProperty({ example: 'LBUSTRUU' })
  @IsString()
  indexRef!: string;
}

export class DesignProductDto {
  @ApiProperty({ example: 'Aurora Private Credit Fund II' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['closedEndFund', 'openEndFund', 'SMA', 'feedFund', 'tokenizedBasket', 'REIT', 'BDC', 'SPV'] })
  @IsEnum(['closedEndFund', 'openEndFund', 'SMA', 'feedFund', 'tokenizedBasket', 'REIT', 'BDC', 'SPV'])
  productType!: string;

  @ApiProperty({ type: ProductStrategyDto })
  @ValidateNested()
  @Type(() => ProductStrategyDto)
  strategy!: ProductStrategyDto;

  @ApiPropertyOptional({ type: BenchmarkDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BenchmarkDto)
  benchmark?: BenchmarkDto;

  @ApiProperty({ type: LiquidityTermsDto })
  @ValidateNested()
  @Type(() => LiquidityTermsDto)
  liquidityTerms!: LiquidityTermsDto;

  @ApiProperty({ type: FeeStructureDto })
  @ValidateNested()
  @Type(() => FeeStructureDto)
  feeStructure!: FeeStructureDto;
}

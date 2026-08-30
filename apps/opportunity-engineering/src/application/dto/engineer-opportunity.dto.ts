import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TargetReturnProfileDto {
  @ApiProperty({ example: 18 })
  @IsNumber()
  targetIrrPercent!: number;

  @ApiProperty({ example: 1.8 })
  @IsNumber()
  targetMultiple!: number;

  @ApiProperty({ example: 36 })
  @IsNumber()
  expectedHoldPeriodMonths!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  upsidePotentialPercent!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  downsideRiskPercent!: number;
}

export class SensitivityFactorDto {
  @ApiProperty({ example: 'rentGrowth' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  baseValue!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  p10!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  p90!: number;
}

export class EngineerOpportunityDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 'Aurora Logistics Opportunity' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiPropertyOptional({ type: TargetReturnProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetReturnProfileDto)
  targetReturn?: TargetReturnProfileDto;

  @ApiPropertyOptional({ type: [SensitivityFactorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensitivityFactorDto)
  sensitivityFactors?: SensitivityFactorDto[];
}

export class AddScenarioDto {
  @ApiProperty({ example: 'Bull case' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['base', 'bull', 'bear', 'stress', 'conservative', 'aggressive'] })
  @IsString()
  scenarioType!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  keyAssumptions?: Record<string, number>;
}

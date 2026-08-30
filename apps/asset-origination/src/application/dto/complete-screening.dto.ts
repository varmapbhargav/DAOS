import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsJsonObject, ValidateIf } from 'class-validator';
import { ScreeningCriterionResult, ScreeningDecision } from '../../libs/shared-kernel/src/value-objects/asset-value-objects';

export class CompleteScreeningDto {
  @ApiProperty({ example: 'All eligibility criteria passed' })
  @IsString()
  comments!: string;

  @ApiPropertyOptional({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'] })
  @IsOptional()
  @IsEnum([ScreeningDecision.PASS, ScreeningDecision.FAIL, ScreeningDecision.CONDITIONAL, ScreeningDecision.REQUIRES_REVIEW])
  decision?: ScreeningDecision;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsJsonObject()
  criteriaResults?: Record<string, ScreeningCriterionResult>;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxScore?: number;
}
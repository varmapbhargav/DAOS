import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, ValidateIf } from 'class-validator';
import { ScreeningDecision, ScreeningCriterionResult } from '../../libs/shared-kernel/src/value-objects/asset-value-objects';

export class StartScreeningDto {
  @ApiProperty({ example: 'Start screening process for the asset' })
  @IsString()
  action!: string;

  @ApiPropertyOptional({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'REQUIRES_REVIEW'] })
  @IsOptional()
  @IsEnum([ScreeningDecision.PASS, ScreeningDecision.FAIL, ScreeningDecision.CONDITIONAL, ScreeningDecision.REQUIRES_REVIEW])
  preDecision?: ScreeningDecision;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRiskAssessmentDto {
  @ApiProperty({ example: 72 })
  @IsNumber()
  overallScore!: number;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  riskLevel!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}

export class AddRiskItemDto {
  @ApiProperty({ enum: [
    'OWNERSHIP', 'LEGAL', 'DOCUMENTATION', 'COUNTERPARTY', 'JURISDICTION', 'REGULATORY_ELIGIBILITY',
    'VALUATION_CONFIDENCE', 'DATA_QUALITY', 'OPERATIONAL', 'MARKET', 'TECHNOLOGY', 'SMART_CONTRACT',
    'CUSTODY', 'CONCENTRATION', 'FRAUD_PROVENANCE',
  ] })
  @IsEnum([
    'OWNERSHIP', 'LEGAL', 'DOCUMENTATION', 'COUNTERPARTY', 'JURISDICTION', 'REGULATORY_ELIGIBILITY',
    'VALUATION_CONFIDENCE', 'DATA_QUALITY', 'OPERATIONAL', 'MARKET', 'TECHNOLOGY', 'SMART_CONTRACT',
    'CUSTODY', 'CONCENTRATION', 'FRAUD_PROVENANCE',
  ])
  category!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  probability!: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  impact!: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mitigation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];
}

export class UpdateRiskItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mitigation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ['OPEN', 'MITIGATED', 'ACCEPTED'] })
  @IsOptional()
  @IsEnum(['OPEN', 'MITIGATED', 'ACCEPTED'])
  status?: string;
}

export class CompleteRiskAssessmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

// ---------------------------------------------------------------------------
// Due Diligence (case-level)
// ---------------------------------------------------------------------------

export class StartDueDiligenceDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reviewers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class AddDdFindingDto {
  @ApiProperty({ enum: [
    'LEGAL', 'FINANCIAL', 'TAX', 'COMMERCIAL', 'REGULATORY', 'OPERATIONAL', 'TECHNICAL',
    'ESG', 'INSURANCE', 'CYBER', 'DIGITAL_ASSET', 'CUSTODY', 'SMART_CONTRACT',
  ] })
  @IsEnum([
    'LEGAL', 'FINANCIAL', 'TAX', 'COMMERCIAL', 'REGULATORY', 'OPERATIONAL', 'TECHNICAL',
    'ESG', 'INSURANCE', 'CYBER', 'DIGITAL_ASSET', 'CUSTODY', 'SMART_CONTRACT',
  ])
  category!: string;

  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'] })
  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'])
  severity!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remediation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewer?: string;
}

export class UpdateDdFindingDto {
  @ApiPropertyOptional({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WAIVED'] })
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WAIVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remediation?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewer?: string;
}

export class CompleteDueDiligenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}

// ---------------------------------------------------------------------------
// Asset-Level Risk
// ---------------------------------------------------------------------------

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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

// ---------------------------------------------------------------------------
// Approval Engine
// ---------------------------------------------------------------------------

export class StartApprovalDto {
  @ApiProperty({ enum: ['SINGLE', 'MULTI_LEVEL_SEQUENTIAL', 'MULTI_LEVEL_PARALLEL', 'CONDITIONAL', 'DELEGATED'] })
  @IsEnum(['SINGLE', 'MULTI_LEVEL_SEQUENTIAL', 'MULTI_LEVEL_PARALLEL', 'CONDITIONAL', 'DELEGATED'])
  approvalType!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  levels?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thresholdAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  requiredApprovers?: Record<string, string[]>;
}

export class RecordApprovalDecisionDto {
  @ApiProperty()
  @IsString()
  approvalCaseId!: string;

  @ApiProperty({ enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'] })
  @IsEnum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'])
  level!: string;

  @ApiProperty({ enum: ['APPROVE', 'REJECT', 'REQUEST_CHANGES'] })
  @IsEnum(['APPROVE', 'REJECT', 'REQUEST_CHANGES'])
  decision!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
}

export class CompleteApprovalDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT', 'CONDITIONALLY_APPROVE'] })
  @IsEnum(['APPROVE', 'REJECT', 'CONDITIONALLY_APPROVE'])
  finalDecision!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

// ---------------------------------------------------------------------------
// Engineering Readiness
// ---------------------------------------------------------------------------

export class AssessEngineeringReadinessDto {
  @ApiProperty()
  @IsString()
  assetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  checks?: Record<string, { passed: boolean; notes?: string }>;
}

export class RecordEngineeringCheckDto {
  @ApiProperty({ enum: [
    'ASSET_IDENTITY', 'OWNERSHIP', 'BENEFICIAL_OWNERSHIP', 'LEGAL_RIGHTS', 'TRANSFERABILITY',
    'PROVENANCE', 'EVIDENCE', 'COUNTERPARTIES', 'COMPLIANCE', 'DD', 'VALUATION', 'ASSET_RISK',
    'DATA_COMPLETENESS', 'CRITICAL_BLOCKERS', 'HIGH_BLOCKERS', 'OPEN_EXCEPTIONS',
  ] })
  @IsEnum([
    'ASSET_IDENTITY', 'OWNERSHIP', 'BENEFICIAL_OWNERSHIP', 'LEGAL_RIGHTS', 'TRANSFERABILITY',
    'PROVENANCE', 'EVIDENCE', 'COUNTERPARTIES', 'COMPLIANCE', 'DD', 'VALUATION', 'ASSET_RISK',
    'DATA_COMPLETENESS', 'CRITICAL_BLOCKERS', 'HIGH_BLOCKERS', 'OPEN_EXCEPTIONS',
  ])
  check!: string;

  @ApiProperty()
  @IsEnum([true, false])
  passed!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
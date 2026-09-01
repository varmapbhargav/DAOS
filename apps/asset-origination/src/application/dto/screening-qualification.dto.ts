import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Screening
// ---------------------------------------------------------------------------

export class ScreeningCriterionOutcomeDto {
  @ApiProperty()
  @IsString()
  rule!: string;

  @ApiProperty({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'NOT_APPLICABLE'] })
  @IsEnum(['PASS', 'FAIL', 'CONDITIONAL', 'NOT_APPLICABLE'])
  result!: 'PASS' | 'FAIL' | 'CONDITIONAL' | 'NOT_APPLICABLE';

  @ApiProperty({ enum: ['INFO', 'WARNING', 'CRITICAL'] })
  @IsEnum(['INFO', 'WARNING', 'CRITICAL'])
  severity!: 'INFO' | 'WARNING' | 'CRITICAL';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class RunScreeningDto {
  @ApiProperty({ enum: ['PENDING', 'PASS', 'FAIL', 'CONDITIONAL', 'MANUAL_REVIEW'] })
  @IsEnum(['PENDING', 'PASS', 'FAIL', 'CONDITIONAL', 'MANUAL_REVIEW'])
  decision!: string;

  @ApiProperty({ example: 85 })
  @IsNumber()
  score!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxScore!: number;

  @ApiPropertyOptional({ type: [ScreeningCriterionOutcomeDto] })
  @IsOptional()
  @IsArray()
  criteria?: ScreeningCriterionOutcomeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}

export class OverrideScreeningDto {
  @ApiProperty({ enum: ['PASS', 'FAIL', 'CONDITIONAL', 'MANUAL_REVIEW'] })
  @IsEnum(['PASS', 'FAIL', 'CONDITIONAL', 'MANUAL_REVIEW'])
  decision!: string;

  @ApiProperty()
  @IsString()
  reason!: string;
}

// ---------------------------------------------------------------------------
// Qualification
// ---------------------------------------------------------------------------

export class QualificationScoreDto {
  @ApiProperty()
  @IsOptional()
  identityComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  ownershipComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  legalComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  evidenceComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  complianceComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  ddComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  valuationComplete!: boolean;

  @ApiProperty()
  @IsOptional()
  transferabilityComplete!: boolean;

  @ApiProperty()
  @IsNumber()
  dataQualityScore!: number;

  @ApiProperty()
  @IsNumber()
  riskScore!: number;

  @ApiProperty()
  @IsNumber()
  overallScore!: number;
}

export class QualificationBlockerDto {
  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  severity!: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;
}

export class RunQualificationDto {
  @ApiProperty({ enum: ['PENDING', 'QUALIFIED', 'DISQUALIFIED', 'CONDITIONAL'] })
  @IsEnum(['PENDING', 'QUALIFIED', 'DISQUALIFIED', 'CONDITIONAL'])
  decision!: string;

  @ApiProperty({ type: QualificationScoreDto })
  score!: QualificationScoreDto;

  @ApiPropertyOptional({ type: [QualificationBlockerDto] })
  @IsOptional()
  @IsArray()
  blockers?: QualificationBlockerDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  missingEvidence?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;
}

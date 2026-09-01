import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

export class CompletenessBreakdownDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  identity!: number;

  @ApiProperty({ example: 92 })
  @IsNumber()
  ownership!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  rights!: number;

  @ApiProperty({ example: 94 })
  @IsNumber()
  evidence!: number;

  @ApiProperty({ example: 86 })
  @IsNumber()
  legal!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  counterparty!: number;

  @ApiProperty({ example: 88 })
  @IsNumber()
  financialData!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  valuation!: number;

  @ApiProperty({ example: 76 })
  @IsNumber()
  dueDiligence!: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  risk!: number;

  @ApiProperty({ example: 90 })
  @IsNumber()
  compliance!: number;

  @ApiProperty({ example: 89 })
  @IsNumber()
  overall!: number;
}

export class CalculateCompletenessDto {
  @ApiProperty({ type: CompletenessBreakdownDto })
  breakdown!: CompletenessBreakdownDto;
}

// ---------------------------------------------------------------------------
// Blockers
// ---------------------------------------------------------------------------

export class RaiseBlockerDto {
  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  severity!: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({ example: 'LEGAL' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'Missing legal ownership evidence' })
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionAction?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceReferences?: string[];
}

export class ResolveBlockerDto {
  @ApiProperty({ enum: ['RESOLVED', 'WAIVED'] })
  @IsEnum(['RESOLVED', 'WAIVED'])
  status!: 'RESOLVED' | 'WAIVED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AssignBlockerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionAction?: string;
}
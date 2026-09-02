import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOriginationCaseDto {
  @ApiProperty({ example: 'Aurora Logistics Portfolio' })
  @IsString()
  @MinLength(2)
  caseName!: string;

  @ApiProperty({ example: 'AO-2026-0001' })
  @IsString()
  caseNumber!: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'EXTERNAL_PORTAL', 'API', 'BULK_IMPORT', 'PARTNER'] })
  @IsOptional()
  @IsString()
  submissionType?: string;

  @ApiPropertyOptional({ enum: ['INTERNAL', 'PORTAL', 'EMAIL', 'API', 'SFTP', 'CSV', 'EXCEL', 'JSON'] })
  @IsOptional()
  @IsString()
  submissionChannel?: string;

  @ApiProperty({ example: 'source-uuid' })
  @IsString()
  sourceId!: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  submittedBy!: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  relationshipManagerId?: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'] })
  @IsString()
  assetClass!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetSubclass?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional({ example: '1500000000' })
  @IsOptional()
  @IsString()
  indicativeValueMinorUnits?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class UpdateOriginationCaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationshipManagerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAnalystId?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextAction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  nextActionDue?: string;
}

export class RejectCaseDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}

export class HoldCaseDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}

export class ResumeCaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetStatus?: string;
}

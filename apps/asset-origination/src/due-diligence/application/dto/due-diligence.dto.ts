import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

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

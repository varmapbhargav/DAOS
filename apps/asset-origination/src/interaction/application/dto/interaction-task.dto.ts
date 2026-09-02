import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

export class RecordInteractionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  counterpartyId?: string;

  @ApiProperty({ enum: ['EMAIL', 'MEETING', 'CALL', 'MESSAGE', 'DATA_REQUEST', 'DOCUMENT_REQUEST', 'SITE_VISIT', 'NEGOTIATION', 'REVIEW'] })
  @IsEnum(['EMAIL', 'MEETING', 'CALL', 'MESSAGE', 'DATA_REQUEST', 'DOCUMENT_REQUEST', 'SITE_VISIT', 'NEGOTIATION', 'REVIEW'])
  type!: string;

  @ApiProperty({ enum: ['INBOUND', 'OUTBOUND'] })
  @IsEnum(['INBOUND', 'OUTBOUND'])
  direction!: string;

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occurredAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ListInteractionsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  counterpartyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export class CreateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiProperty({ enum: ['REQUEST_DOCUMENT', 'VERIFY_OWNERSHIP', 'LEGAL_REVIEW', 'COMPLIANCE_REVIEW', 'DUE_DILIGENCE', 'VALUATION', 'RISK_REVIEW', 'APPROVAL', 'RESOLVE_BLOCKER'] })
  @IsEnum(['REQUEST_DOCUMENT', 'VERIFY_OWNERSHIP', 'LEGAL_REVIEW', 'COMPLIANCE_REVIEW', 'DUE_DILIGENCE', 'VALUATION', 'RISK_REVIEW', 'APPROVAL', 'RESOLVE_BLOCKER'])
  type!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  slaHours?: number;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'OVERDUE'] })
  @IsOptional()
  @IsEnum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'OVERDUE'])
  status?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  escalationReason?: string;
}

export class AssignTaskDto {
  @ApiProperty()
  @IsString()
  assignee!: string;
}

export class AddTaskDependencyDto {
  @ApiProperty()
  @IsString()
  taskId!: string;

  @ApiProperty({ enum: ['BLOCKS', 'BLOCKED_BY', 'RELATES_TO'] })
  @IsEnum(['BLOCKS', 'BLOCKED_BY', 'RELATES_TO'])
  type!: string;
}

export class EscalateTaskDto {
  @ApiProperty()
  @IsString()
  escalatedTo!: string;

  @ApiProperty()
  @IsString()
  reason!: string;
}

export class ListTasksQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  overdue?: boolean;
}
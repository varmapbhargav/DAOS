import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

import { CorporateDocType } from '@daos/shared-kernel';

const DOC_TYPES = [
  'operatingAgreement',
  'subscriptionAgreement',
  'ppm',
  'lpAgreement',
  'certOfFormation',
  'registerOfMembers',
] as const;

export class ActivateEntityDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  activatedBy!: string;
}

export class UpdateHierarchyDto {
  @ApiPropertyOptional({ example: 'parent-entity-uuid' })
  @IsOptional()
  @IsString()
  parentEntityId?: string | null;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  childEntityIds?: string[];

  @ApiProperty({ example: 'subsidiary' })
  @IsString()
  relationType!: string;
}

export class AppointRegisteredAgentDto {
  @ApiProperty({ example: 'Corp Services Inc' })
  @IsString()
  agencyName!: string;

  @ApiProperty({ example: 'agent-ref-1' })
  @IsString()
  agentRef!: string;

  @ApiProperty({ example: 'Delaware' })
  @IsString()
  jurisdiction!: string;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  @IsISO8601()
  goodStandingDate!: string;
}

export class AddEntityDocumentDto {
  @ApiProperty({ enum: DOC_TYPES })
  @IsEnum(DOC_TYPES)
  docType!: CorporateDocType;

  @ApiProperty({ example: 'gs://daos/legal/hr/operating-agreement-v1.pdf' })
  @IsString()
  fileRef!: string;
}

export class DissolveEntityDto {
  @ApiProperty({ example: 'Regulatory wind-down' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
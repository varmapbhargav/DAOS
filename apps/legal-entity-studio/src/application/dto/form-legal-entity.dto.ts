import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';

import { EntityType } from '@daos/shared-kernel';

const ENTITY_TYPES = [
  'delawareLLC',
  'delawareCorpC',
  'caymanSPV',
  'caymanLP',
  'luxSOPARFI',
  'sgVCC',
  'irishQIAIF',
  'bermudaLP',
] as const;

export class FormLegalEntityDto {
  @ApiProperty({ example: 'Aurora Holdings LLC' })
  @IsString()
  @MinLength(2)
  legalName!: string;

  @ApiProperty({ enum: ENTITY_TYPES })
  @IsEnum(ENTITY_TYPES)
  entityType!: EntityType;

  @ApiProperty({ example: 'Delaware' })
  @IsString()
  @MinLength(2)
  jurisdiction!: string;
}
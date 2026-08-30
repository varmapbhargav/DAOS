import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { BlockchainNetwork, InstrumentType } from '@daos/shared-kernel';

const INSTRUMENT_TYPES = [
  'commonEquity',
  'preferredEquity',
  'REITShare',
  'LPInterest',
  'debtToken',
  'convertibleNote',
  'revenueShareToken',
  'fundUnit',
] as const;

const NETWORKS = ['ethereum', 'polygon', 'avalanche', 'hyperledger', 'stellar'] as const;

export class CreateIssuanceDto {
  @ApiProperty({ example: 'Aurora Fund I Token' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: INSTRUMENT_TYPES })
  @IsEnum(INSTRUMENT_TYPES)
  instrumentType!: InstrumentType;

  @ApiProperty({ enum: NETWORKS })
  @IsEnum(NETWORKS)
  network!: BlockchainNetwork;

  @ApiPropertyOptional({ example: 'cap-table-uuid' })
  @IsOptional()
  @IsString()
  capTableId?: string | null;
}
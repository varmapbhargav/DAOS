import { ShareholderType } from '@daos/shared-kernel';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class InitializeCapTableDto {
  @ApiPropertyOptional({ example: 'issuance-123' })
  @IsOptional()
  @IsString()
  issuanceId?: string;

  @ApiPropertyOptional({ example: 'common' })
  @IsOptional()
  @IsString()
  shareClassId?: string;
}

export class AddShareholderDto {
  @ApiProperty({ example: 'sh-001' })
  @IsString()
  @IsNotEmpty()
  shareholderId!: string;

  @ApiProperty({ example: 'Acme Ventures LLC' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ['investor', 'sponsor', 'founder', 'employee', 'other'] })
  @IsIn(['investor', 'sponsor', 'founder', 'employee', 'other'])
  shareholderType!: ShareholderType;

  @ApiPropertyOptional({ example: '0xAb58...' })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({ example: 'common' })
  @IsString()
  @IsNotEmpty()
  shareClassId!: string;

  @ApiProperty({ example: 1000000, description: 'Units held (integer)' })
  @IsInt()
  @Min(0)
  unitsHeld!: number;
}

export class TransferSharesDto {
  @ApiProperty({ example: 'sh-001' })
  @IsString()
  @IsNotEmpty()
  fromShareholderId!: string;

  @ApiProperty({ example: 'sh-002' })
  @IsString()
  @IsNotEmpty()
  toShareholderId!: string;

  @ApiPropertyOptional({ example: 'common' })
  @IsOptional()
  @IsString()
  shareClassId?: string;

  @ApiProperty({ example: 5000, description: 'Units to transfer (integer)' })
  @IsInt()
  @Min(1)
  units!: number;

  @ApiPropertyOptional({ example: 'manual' })
  @IsOptional()
  @IsString()
  transferType?: string;
}

export class SyncCapTableDto {
  @ApiProperty({ example: 1500000, description: 'Total units confirmed on chain' })
  @IsInt()
  @Min(0)
  totalIssuedUnits!: number;

  @ApiProperty({ example: '14500000' })
  @IsString()
  @IsNotEmpty()
  blockNumber!: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        shareholderId: { type: 'string' },
        name: { type: 'string' },
        walletAddress: { type: 'string', nullable: true },
        shareClassId: { type: 'string' },
        units: { type: 'number' },
      },
    },
  })
  shareholders!: Array<{
    shareholderId: string;
    name: string;
    walletAddress: string | null;
    shareClassId: string;
    units: number;
  }>;
}
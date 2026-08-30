import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class RejectKycDto {
  @ApiProperty({ example: 'Document invalid' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class VerifyAccreditationDto {
  @ApiProperty({ enum: ['accreditedInvestor', 'qualifiedPurchaser', 'qualifiedClient', 'regS', 'regA', 'reg506b', 'reg506c'] })
  @IsEnum(['accreditedInvestor', 'qualifiedPurchaser', 'qualifiedClient', 'regS', 'regA', 'reg506b', 'reg506c'])
  level!: string;
}

export class LinkWalletDto {
  @ApiProperty({ example: '0xabc123…' })
  @IsString()
  address!: string;
}

export class UpdateRiskProfileDto {
  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  riskTolerance!: string;

  @ApiProperty({ example: 24 })
  investmentHorizon!: number;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  liquidityNeeds!: string;
}

export class SuspendInvestorDto {
  @ApiProperty({ example: 'Regulatory hold' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

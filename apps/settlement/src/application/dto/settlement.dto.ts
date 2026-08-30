import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MoneyDto {
  @ApiProperty({ example: '100000000', description: 'Integer minor units' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Invalid ISO currency' })
  currency!: string;
}

export class SettlementLegDto {
  @ApiProperty({ enum: ['brokerBuyer', 'brokerSeller', 'custodianBuyer', 'custodianSeller', 'centralCounterparty'] })
  @IsString()
  party!: string;

  @ApiProperty({ example: 'security-1' })
  @IsString()
  @IsNotEmpty()
  securityId!: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;

  @ApiProperty({ type: MoneyDto })
  amount!: MoneyDto;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  settlementDate!: string;
}

export class InitiateSettlementDto {
  @ApiProperty({ example: 'trade-ref-1' })
  @IsString()
  @IsNotEmpty()
  tradeReference!: string;

  @ApiProperty({ enum: ['cash', 'securities', 'deliveryVsPayment', 'freeDelivery'] })
  @IsString()
  settlementType!: string;

  @ApiProperty({ enum: ['T0', 'T1', 'T2', 'T3', 'T5'] })
  @IsString()
  cycle!: string;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  settlementDate!: string;

  @ApiProperty({ example: 'security-1' })
  @IsString()
  @IsNotEmpty()
  securityId!: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;

  @ApiProperty({ type: MoneyDto })
  amount!: MoneyDto;

  @ApiProperty({ type: [SettlementLegDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettlementLegDto)
  legs!: SettlementLegDto[];
}

export class FailSettlementDto {
  @ApiProperty({ example: 'Custodian rejected instruction' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class OpenCustodyAccountDto {
  @ApiProperty({ example: 'investor-1' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ enum: ['broker', 'bank', 'thirdParty', 'internal'] })
  @IsString()
  custodyType!: string;

  @ApiProperty({ example: 'custodian-ref-1' })
  @IsString()
  @IsNotEmpty()
  custodianRef!: string;
}

export class CreditHoldingDto {
  @ApiProperty({ example: 'security-1' })
  @IsString()
  @IsNotEmpty()
  securityId!: string;

  @ApiProperty({ example: '500' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;

  @ApiProperty({ type: MoneyDto })
  price!: MoneyDto;
}

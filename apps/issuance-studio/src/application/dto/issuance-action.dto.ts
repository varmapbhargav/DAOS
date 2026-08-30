import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

export class SignLegalDocsDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  signedBy!: string;
}

export class RequestMintDto {
  @ApiProperty({ example: '1000000000000000000' })
  @IsString()
  amountMinorUnits!: string;

  @ApiProperty({ example: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B' })
  @IsString()
  toAddress!: string;
}

export class AddToWhitelistDto {
  @ApiProperty({ example: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B' })
  @IsString()
  walletAddress!: string;

  @ApiProperty({ example: 'investor-uuid' })
  @IsString()
  investorId!: string;
}

export class RemoveFromWhitelistDto {
  @ApiProperty({ example: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B' })
  @IsString()
  walletAddress!: string;
}

export class TransferRestrictionDto {
  @ApiProperty({ example: 'lockup' })
  @IsString()
  @MinLength(2)
  restrictionType!: string;

  @ApiProperty({ example: 180 })
  @IsInt()
  @Min(0)
  holdingPeriodDays!: number;

  @ApiProperty({ example: 'US-NY' })
  @IsString()
  jurisdictionBlock!: string;
}

export class SyncCapTableDto {
  @ApiProperty({ example: 'cap-table-uuid' })
  @IsString()
  capTableId!: string;
}

export class WhitelistBatchDto {
  @ApiProperty({ type: [AddToWhitelistDto] })
  @IsArray()
  entries!: AddToWhitelistDto[];
}
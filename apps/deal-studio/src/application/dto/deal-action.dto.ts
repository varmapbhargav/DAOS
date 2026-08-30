import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateCapitalStackTrancheDto {
  @ApiProperty({ enum: ['senior', 'mezzanine', 'juniorDebt', 'preferredEquity', 'commonEquity'] })
  @IsEnum(['senior', 'mezzanine', 'juniorDebt', 'preferredEquity', 'commonEquity'])
  trancheType!: string;

  @ApiProperty({ example: '50000000' })
  @IsString()
  amountMinorUnits!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  amountCurrency!: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  coupon!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  seniority!: number;
}

export class UpdateCapitalStackDto {
  @ApiProperty({ type: [UpdateCapitalStackTrancheDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCapitalStackTrancheDto)
  tranches!: UpdateCapitalStackTrancheDto[];
}

export class FinalizeTermSheetDto {
  @ApiProperty({ example: 'analyst-uuid' })
  @IsString()
  finalizedBy!: string;
}

export class MeetClosingConditionDto {
  @ApiProperty({ example: 'Executed loan documents' })
  @IsString()
  @MinLength(3)
  description!: string;
}

export class ApproveDealDto {
  @ApiProperty({ example: 'credit-analyst-uuid' })
  @IsString()
  approvedBy!: string;
}

export class CloseDealDto {
  @ApiProperty({ example: 'closing-officer-uuid' })
  @IsString()
  closedBy!: string;
}

export class CancelDealDto {
  @ApiProperty({ example: 'Sponsor withdrew from the transaction' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

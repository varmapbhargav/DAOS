import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';

export class AddShareClassDto {
  @ApiProperty({ example: 'Class A' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  @IsPositive()
  targetSizeMinorUnits!: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsPositive()
  minInvestmentMinorUnits!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  maxInvestors!: number;
}

export class UpdateFeeStructureDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  managementFeeAnnual!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  performanceFee!: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  hurdleRate!: number;

  @ApiProperty({ example: true })
  @IsOptional()
  highWaterMark?: boolean;

  @ApiProperty({ example: 10 })
  @IsNumber()
  catchUpPercentage!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  catchUpRate!: number;
}

export class ApproveProductDto {
  @ApiProperty({ example: 'compliance-officer-uuid' })
  @IsString()
  approvedBy!: string;
}

export class RejectProductDto {
  @ApiProperty({ example: 'Fails concentration limits' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class SetPriceDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsPositive()
  pricePerShareMinorUnits!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;
}

export class FeeProjectionDto {
  @ApiProperty({ example: 10000000 })
  @IsNumber()
  @IsPositive()
  grossAmountMinorUnits!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;
}

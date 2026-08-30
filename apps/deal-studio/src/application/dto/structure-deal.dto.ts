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

export class CapitalTrancheDto {
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

export class CapitalStackDto {
  @ApiProperty({ type: [CapitalTrancheDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapitalTrancheDto)
  tranches!: CapitalTrancheDto[];
}

export class StructureDealDto {
  @ApiProperty({ example: 'Aurora Credit Facility' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiPropertyOptional({ type: CapitalStackDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CapitalStackDto)
  capitalStack?: CapitalStackDto;
}

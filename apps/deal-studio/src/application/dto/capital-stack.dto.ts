import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsISO8601, IsInt, IsOptional,
  IsString, Min, MinLength, ValidateNested,
} from 'class-validator';
import { Percentage } from '@daos/shared-kernel';

export class TrancheEconomicsDto {
  @ApiProperty({ enum: ['FIXED', 'FLOATING'] })
  @IsEnum(['FIXED', 'FLOATING'])
  interestRateType!: string;

  @ApiPropertyOptional({ example: '8.5' })
  @IsOptional() @IsString()
  fixedRate?: Percentage;

  @ApiPropertyOptional({ example: 'SOFR' })
  @IsOptional() @IsString()
  floatingReferenceRate?: string;

  @ApiPropertyOptional({ example: '2.5' })
  @IsOptional() @IsString()
  spread?: Percentage;

  @ApiProperty({ enum: ['MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL','AT_MATURITY'] })
  @IsEnum(['MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL','AT_MATURITY'])
  couponFrequency!: string;

  @ApiProperty({ example: '2030-12-31' })
  @IsOptional() @IsISO8601()
  maturityDate?: string;

  @ApiProperty({ example: 0 })
  @IsInt() @Min(0)
  gracePeriodMonths!: number;

  @ApiProperty({ enum: ['BULLET','AMORTIZING','INTEREST_ONLY','PIK'] })
  @IsEnum(['BULLET','AMORTIZING','INTEREST_ONLY','PIK'])
  amortizationType!: string;

  @ApiPropertyOptional({ example: '15.0' })
  @IsOptional() @IsString()
  defaultInterestRate?: Percentage;

  @ApiProperty({ example: false })
  @IsBoolean()
  pikAllowed!: boolean;
}

export class CapitalTrancheInputDto {
  @ApiProperty({ example: 'Senior Term Loan A' })
  @IsString() @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['SENIOR_DEBT','MEZZANINE_DEBT','JUNIOR_DEBT','PREFERRED_EQUITY','COMMON_EQUITY','CONVERTIBLE_INSTRUMENT','REVENUE_PARTICIPATION','HYBRID_INSTRUMENT'] })
  @IsEnum(['SENIOR_DEBT','MEZZANINE_DEBT','JUNIOR_DEBT','PREFERRED_EQUITY','COMMON_EQUITY','CONVERTIBLE_INSTRUMENT','REVENUE_PARTICIPATION','HYBRID_INSTRUMENT'])
  type!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: '50000000' })
  @IsString()
  targetAmountMinorUnits!: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  seniority!: number;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  ranking!: number;

  @ApiProperty({ type: TrancheEconomicsDto })
  @ValidateNested() @Type(() => TrancheEconomicsDto)
  economics!: TrancheEconomicsDto;
}

export class UpdateCapitalStackDto {
  @ApiProperty({ type: [CapitalTrancheInputDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => CapitalTrancheInputDto)
  tranches!: CapitalTrancheInputDto[];

  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

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

export class WaterfallTierDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  tierOrder!: number;

  @ApiProperty({
    enum: ['returnOfCapital', 'preferredReturn', 'catchUp', 'carriedInterest', 'commonEquity'],
  })
  @IsString()
  tierType!: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  distributionRate?: number | null;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  catchUpRate?: number | null;
}

export class CreateWaterfallModelDto {
  @ApiProperty({ example: 'Series A Waterfall' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ['american', 'european', 'hybrid'] })
  @IsString()
  waterfallType!: string;

  @ApiProperty({ example: 'product-123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ type: [WaterfallTierDto] })
  @IsArray()
  tiers!: WaterfallTierDto[];
}

export class DeclareDistributionDto {
  @ApiProperty({ example: 'product-123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ enum: ['income', 'capitalReturn', 'dividendCash', 'dividendScrip', 'carriedInterest'] })
  @IsString()
  distributionType!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ example: '100000000', description: 'Integer minor units' })
  @IsString()
  @IsNotEmpty()
  totalAmount!: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsString()
  @IsNotEmpty()
  recordDate!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsString()
  @IsNotEmpty()
  paymentDate!: string;
}

export class InvestorShareDto {
  @ApiProperty({ example: 'investor-456' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  shares!: number;
}

export class CalculateDistributionDto {
  @ApiProperty({
    example: [{ investorId: 'investor-456', shares: 1000 }],
    type: [InvestorShareDto],
  })
  @IsArray()
  investorShares!: InvestorShareDto[];

  @ApiPropertyOptional({ example: { 'investor-456': { treaty: true } } })
  @IsOptional()
  taxProfiles?: Record<string, { treaty?: boolean; fatcaExempt?: boolean; crsReported?: boolean }>;
}

export class InvestorElectionDto {
  @ApiProperty({ example: 'investor-456' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ example: 'cash' })
  @IsString()
  @IsNotEmpty()
  electionType!: string;

  @ApiProperty({ example: '2026-02-01' })
  @IsString()
  @IsNotEmpty()
  electionDate!: string;
}

export class AnnounceCorporateActionDto {
  @ApiProperty({ example: 'issuance-789' })
  @IsString()
  @IsNotEmpty()
  issuanceId!: string;

  @ApiProperty({
    enum: ['stockSplit', 'reverseStockSplit', 'redemption', 'buyback', 'rightsIssue', 'merger', 'spinOff', 'dividendReinvestment'],
  })
  @IsString()
  type!: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsString()
  @IsNotEmpty()
  exDate!: string;

  @ApiProperty({ example: '2026-03-02' })
  @IsString()
  @IsNotEmpty()
  recordDate!: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsString()
  @IsNotEmpty()
  paymentDate!: string;

  @ApiProperty({ example: ['cash', 'stock'] })
  @IsArray()
  options!: string[];
}

export class CloseElectionDto {
  @ApiProperty({ type: [InvestorElectionDto] })
  @IsArray()
  elections!: InvestorElectionDto[];
}

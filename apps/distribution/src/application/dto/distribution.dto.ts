import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';

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

export class ReceiveSubscriptionDto {
  @ApiProperty({ example: 'product-123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'investor-456' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ type: MoneyDto })
  requestedAmount!: MoneyDto;
}

export class AllocateSubscriptionsDto {
  @ApiProperty({ example: 'closing-123' })
  @IsString()
  @IsNotEmpty()
  closingId!: string;

  @ApiProperty({ example: 'product-123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ enum: ['proRata', 'discretionary', 'firstComeFirstServed'] })
  @IsString()
  method!: 'proRata' | 'discretionary' | 'firstComeFirstServed';

  @ApiProperty({ type: MoneyDto })
  totalAmount!: MoneyDto;
}

export class RejectSubscriptionDto {
  @ApiProperty({ example: 'AML verification failed' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class IssueCapitalCallDto {
  @ApiProperty({ example: 'closing-123' })
  @IsString()
  @IsNotEmpty()
  closingId!: string;

  @ApiProperty({ example: 'investor-456' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ type: MoneyDto })
  amount!: MoneyDto;

  @ApiProperty({ example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  dueDate!: string;
}

export class FundCapitalCallDto {
  @ApiProperty({ type: MoneyDto })
  amount!: MoneyDto;
}
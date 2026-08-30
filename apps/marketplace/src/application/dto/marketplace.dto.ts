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

export class PublishListingDto {
  @ApiProperty({ example: 'product-123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: 'issue-456' })
  @IsOptional()
  @IsString()
  issueId?: string;

  @ApiProperty({ enum: ['primary', 'secondary'] })
  @IsString()
  listingType!: 'primary' | 'secondary';

  @ApiProperty({ enum: ['orderBook', 'OTCBilateral', 'auctionBookBuild', 'RFQ', 'NAVBased', 'darkPool'] })
  @IsString()
  mechanism!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ example: '1000000' })
  @IsString()
  @IsNotEmpty()
  totalQuantity!: string;

  @ApiProperty({ example: '100' })
  @IsString()
  @IsNotEmpty()
  minimumQuantity!: string;

  @ApiPropertyOptional({ type: MoneyDto })
  @IsOptional()
  referencePrice?: MoneyDto;

  @ApiPropertyOptional({
    example: { openAt: '09:00', closeAt: '17:00', timezone: 'America/New_York' },
  })
  @IsOptional()
  session?: { openAt: string; closeAt: string; timezone: string };
}

export class SuspendListingDto {
  @ApiProperty({ example: 'Compliance review' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class DelistListingDto {
  @ApiProperty({ example: 'End of raise' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class PlaceOrderDto {
  @ApiProperty({ example: 'listing-123' })
  @IsString()
  @IsNotEmpty()
  listingId!: string;

  @ApiProperty({ example: 'investor-456' })
  @IsString()
  @IsNotEmpty()
  investorId!: string;

  @ApiProperty({ enum: ['buy', 'sell'] })
  @IsString()
  side!: 'buy' | 'sell';

  @ApiProperty({ enum: ['market', 'limit', 'stop', 'IOC', 'FOK', 'GTC'] })
  @IsString()
  orderType!: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  quantity!: string;

  @ApiPropertyOptional({ type: MoneyDto })
  @IsOptional()
  limitPrice?: MoneyDto;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Change of mind' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

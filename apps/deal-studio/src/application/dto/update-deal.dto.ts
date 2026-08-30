import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DealMetadataDto } from './deal-metadata.dto';
import { Percentage } from '@daos/shared-kernel';

export class UpdateDealDto {
  @ApiPropertyOptional({ example: 'Updated Deal Name' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ type: DealMetadataDto })
  @IsOptional() @ValidateNested() @Type(() => DealMetadataDto)
  metadata?: DealMetadataDto;

  @ApiPropertyOptional({ type: Percentage })
  @IsOptional() @IsString()
  targetIrr?: Percentage;

  @ApiPropertyOptional({ type: String })
  @IsOptional() @IsString()
  targetMoic?: string;

  @ApiPropertyOptional({ type: Percentage })
  @IsOptional() @IsString()
  expectedYield?: Percentage;
}
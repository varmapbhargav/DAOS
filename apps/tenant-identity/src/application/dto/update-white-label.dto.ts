import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateWhiteLabelDto {
  @ApiProperty({ example: '#112233' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  brandColor!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  customDomain?: string;

  @ApiProperty({ required: false, example: { beta: true } })
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, boolean>;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveKycDto {
  @ApiPropertyOptional({ example: 'Docs verified via provider' })
  @IsOptional()
  @IsString()
  note?: string;
}

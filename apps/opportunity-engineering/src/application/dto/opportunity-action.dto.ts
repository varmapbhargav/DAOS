import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString, MinLength } from 'class-validator';

export class ScoreOpportunityDto {
  @ApiProperty({ example: 74 })
  @IsNumber()
  overall!: number;

  @ApiProperty({ type: Object })
  @IsObject()
  components!: Record<string, number>;
}

export class ApproveOpportunityDto {
  @ApiProperty({ example: 'analyst-uuid' })
  @IsString()
  approvedBy!: string;
}

export class RejectOpportunityDto {
  @ApiProperty({ example: 'Insufficient projected returns' })
  @IsString()
  @MinLength(3)
  reason!: string;
}

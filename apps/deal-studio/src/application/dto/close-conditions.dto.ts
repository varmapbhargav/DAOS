export class CloseConditionsSubmitDto {
  @ApiProperty({ example 'condition-uuid' })
  @IsString()
  conditionId!: string;

  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiPropertyOptional({ example: 'doc-uuid' })
  @IsOptional() @IsString()
  evidenceRef?: string;
}

export class CloseConditionsVerifyDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  verifiedBy!: string;

  @ApiPropertyOptional({ example: 'doc-uuid' })
  @IsOptional() @IsString()
  evidenceRef?: string;
}

export class CloseConditionsWaiveDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  waivedBy!: string;

  @ApiProperty({ example: 'Reason for waiver' })
  @IsString()
  reason!: string;
}

export class PutOnHoldDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiProperty({ example: 'Hold reason' })
  @IsString()
  holdReason!: string;
}
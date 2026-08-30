export class CreateAssetDraftCommand {
  constructor(public readonly dto: CreateAssetDraftDto) {}
}

export class CreateAssetDraftDto {
  @ApiProperty({ example: 'Aurora Logistics Portfolio' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: ['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'] })
  @IsEnum(['realEstate', 'privateEquity', 'privateCredit', 'infrastructure', 'ventureCapital', 'commodities', 'digitalAssets'])
  assetClass!: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];
}
import { DocumentCategory, EntityReference } from '@daos/shared-kernel';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class EntityReferenceDto implements EntityReference {
  @ApiProperty({ example: 'issuance' })
  @IsString()
  @IsNotEmpty()
  entityType!: string;

  @ApiProperty({ example: 'issuance-id-123' })
  @IsString()
  @IsNotEmpty()
  entityId!: string;
}

export class UploadDocumentDto {
  @ApiProperty({ example: 'private-placement-memorandum.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ enum: ['legalAgreement', 'subscriptionDocument', 'offeringMemorandum', 'financialStatement', 'corporateRecord', 'regulatoryFiling', 'governance', 'other'] })
  @IsIn(['legalAgreement', 'subscriptionDocument', 'offeringMemorandum', 'financialStatement', 'corporateRecord', 'regulatoryFiling', 'governance', 'other'])
  category!: DocumentCategory;

  @ApiProperty({ type: EntityReferenceDto })
  @IsObject()
  entityRef!: EntityReference;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty({ example: 1048576 })
  @IsInt()
  @Min(0)
  sizeBytes!: number;

  @ApiPropertyOptional({ description: 'Base64-encoded file content for the stub storage adapter' })
  @IsOptional()
  @IsString()
  contentBase64?: string;
}
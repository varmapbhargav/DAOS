import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddDocumentVersionDto {
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
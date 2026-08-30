import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class InvestorProfileDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  legalName!: string;

  @ApiProperty({ example: '1985-06-01' })
  @IsISO8601()
  dateOfBirth!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  nationality!: string;

  @ApiProperty({ example: '123-45-6789' })
  @IsString()
  taxId!: string;
}

export class RegisterInvestorDto {
  @ApiProperty({ example: 'investor@acme.test' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ type: InvestorProfileDto })
  profile!: InvestorProfileDto;
}

export class SubmitKycDto {
  @ApiProperty({ type: [Object], example: [{ documentType: 'passport', fileRef: 's3://…', checksum: 'abc' }] })
  documents!: { documentType: string; fileRef: string; checksum: string; uploadedAt?: string }[];
}

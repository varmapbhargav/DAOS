import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ProvisionTenantDto {
  @ApiProperty({ example: 'acme' })
  @IsString()
  @Matches(/^[a-zA-Z0-9-]{3,63}$/, { message: 'subdomain must be 3-63 chars of a-z, 0-9, -' })
  subdomain!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'boss@acme.test' })
  @IsEmail()
  adminEmail!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  adminPassword!: string;
}

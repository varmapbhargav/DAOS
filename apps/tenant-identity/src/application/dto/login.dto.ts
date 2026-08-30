import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'acme' })
  @IsString()
  @Matches(/^[a-zA-Z0-9-]{3,63}$/)
  subdomain!: string;

  @ApiProperty({ example: 'boss@acme.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}

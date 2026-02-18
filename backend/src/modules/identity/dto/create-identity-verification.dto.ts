import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBase64 } from 'class-validator';

export class CreateIdentityVerificationDto {
  @ApiProperty({ description: 'NID number' })
  @IsString()
  nidNumber: string;

  @ApiProperty({ description: 'NID front image (base64 or file)' })
  @IsString()
  nidFrontImage: string;

  @ApiProperty({ description: 'NID back image (base64 or file)' })
  @IsString()
  nidBackImage: string;

  @ApiProperty({ description: 'Selfie image (base64 or file)' })
  @IsString()
  selfieImage: string;
}

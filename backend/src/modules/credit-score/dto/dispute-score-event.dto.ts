import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DisputeScoreEventDto {
  @ApiProperty({ description: 'Tenant right-of-reply before score impact is finalized' })
  @IsString()
  @MinLength(10)
  tenantResponse: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { DisputeType, DisputePriority } from '@prisma/client';

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  leaseId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty()
  @IsString()
  landlordId: string;

  @ApiProperty({ enum: DisputeType })
  @IsEnum(DisputeType)
  type: DisputeType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: DisputePriority, required: false })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;
}

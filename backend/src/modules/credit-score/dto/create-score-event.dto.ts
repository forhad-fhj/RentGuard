import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ScoreEventType } from '@prisma/client';

export class CreateScoreEventDto {
  @ApiProperty()
  @IsUUID()
  tenantId: string;

  @ApiProperty({ enum: ScoreEventType })
  @IsEnum(ScoreEventType)
  type: ScoreEventType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

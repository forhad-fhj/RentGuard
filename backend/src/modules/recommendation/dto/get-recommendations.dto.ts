import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

export class GetRecommendationsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxRent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}


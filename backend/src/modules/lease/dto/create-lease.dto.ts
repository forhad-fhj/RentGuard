import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateLeaseDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty()
  @IsString()
  landlordId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsNumber()
  monthlyRent: number;

  @ApiProperty()
  @IsNumber()
  depositAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  terms?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  lateFeePercentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  noticePeriodDays?: number;
}

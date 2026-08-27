import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ApplicationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('mine')
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'List current tenant applications' })
  async findMine(@CurrentUser() user: { id: string }) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });
    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }
    return this.applicationService.findByTenant(tenantProfile.id);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Accept/reject (landlord) or withdraw (tenant) an application' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateStatus(
      id,
      user.id,
      user.role,
      dto.status,
    );
  }
}

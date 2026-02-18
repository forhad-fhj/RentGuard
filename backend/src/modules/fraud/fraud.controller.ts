import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('fraud')
@Controller('fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@ApiBearerAuth('JWT-auth')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Get('signals')
  @ApiOperation({ summary: 'Get all fraud signals (Admin only)' })
  async getAllFraudSignals(@Query() filters: any) {
    return this.fraudService.getAllFraudSignals(filters);
  }
}

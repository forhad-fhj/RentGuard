import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user' })
  async suspendUser(
    @Param('id') userId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.suspendUser(userId, body.reason);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend a user' })
  async unsuspendUser(@Param('id') userId: string) {
    return this.adminService.unsuspendUser(userId);
  }

  @Get('verification/pending')
  @ApiOperation({ summary: 'List profiles pending manual verification review' })
  async getPendingVerifications() {
    return this.adminService.getPendingProfileVerifications();
  }

  @Post('verification/:userId/approve')
  @ApiOperation({ summary: 'Approve a user profile after manual selfie review' })
  async approveVerification(@Param('userId') userId: string) {
    return this.adminService.approveProfileVerification(userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ReviewFlagReason, ReviewFlagStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';

class UpdateReviewFlagDto {
  @IsEnum(ReviewFlagStatus)
  status: ReviewFlagStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  markReviewed?: boolean;
}

class FlagUserDto {
  @IsEnum(ReviewFlagReason)
  reason: ReviewFlagReason;

  @IsOptional()
  @IsString()
  notes?: string;
}

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

  @Get('review-queue')
  @ApiOperation({ summary: 'Open ReviewFlags queue for manual selfie review' })
  async getReviewQueue() {
    return this.adminService.getReviewQueue();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'View user profile + selfie for admin review' })
  async getUserForReview(@Param('id') userId: string) {
    return this.adminService.getUserForReview(userId);
  }

  @Patch('review-flags/:id')
  @ApiOperation({ summary: 'Resolve or dismiss a review flag' })
  async updateReviewFlag(
    @Param('id') flagId: string,
    @CurrentUser() admin: { id: string },
    @Body() dto: UpdateReviewFlagDto,
  ) {
    return this.adminService.updateReviewFlag(flagId, admin.id, dto);
  }

  @Post('users/:id/flag')
  @ApiOperation({ summary: 'Manually flag a user for review' })
  async flagUser(@Param('id') userId: string, @Body() dto: FlagUserDto) {
    return this.adminService.flagUser(userId, dto.reason, dto.notes);
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
  @ApiOperation({ summary: 'Alias for review-queue (deprecated)' })
  async getPendingVerifications() {
    return this.adminService.getReviewQueue();
  }

  @Post('verification/:userId/approve')
  @ApiOperation({ summary: 'Mark profile as reviewed (deprecated alias)' })
  async approveVerification(@Param('userId') userId: string) {
    return this.adminService.markProfileReviewed(userId);
  }
}

import { Controller, Get, Param, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditScoreService } from './credit-score.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('credit-score')
@Controller('credit-score')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CreditScoreController {
  constructor(
    private readonly creditScoreService: CreditScoreService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my credit score' })
  async getMyCreditScore(@CurrentUser() user: any) {
    // Get tenant profile ID
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.creditScoreService.getCreditScore(tenantProfile.id);
  }

  @Get('tenant/:tenantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get tenant credit score (Landlord/Admin)' })
  async getTenantCreditScore(@Param('tenantId') tenantId: string) {
    return this.creditScoreService.getCreditScore(tenantId);
  }

  @Post('recalculate/:tenantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Recalculate credit score (Admin only)' })
  async recalculateCreditScore(@Param('tenantId') tenantId: string) {
    return this.creditScoreService.recalculateCreditScore(tenantId);
  }
}

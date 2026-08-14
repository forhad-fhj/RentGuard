import { Controller, Get, Param, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditScoreService } from './credit-score.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

function toScoreBand(score: number): 'Good' | 'Fair' | 'Poor' {
  if (score >= 750) return 'Good';
  if (score >= 500) return 'Fair';
  return 'Poor';
}

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
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Get my credit score with full breakdown' })
  async getMyCreditScore(@CurrentUser() user: any) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.creditScoreService.getCreditScore(tenantProfile.id);
  }

  @Get('tenant/:tenantId')
  @UseGuards(RolesGuard, TierGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get tenant credit score (Landlord/Admin)',
    description:
      'Free-tier landlords see score band only (Good/Fair/Poor). Premium landlords see exact score.',
  })
  async getTenantCreditScore(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    const creditScore = await this.creditScoreService.getCreditScore(tenantId);

    if (!creditScore) {
      throw new NotFoundException('Credit score not found');
    }

    const isAdmin =
      user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    const isPremiumLandlord = user.subscriptionTier === 'PREMIUM_LANDLORD';

    if (isAdmin || isPremiumLandlord) {
      return creditScore;
    }

    return {
      tenantId,
      scoreBand: toScoreBand(creditScore.score),
      riskCategory: creditScore.riskCategory,
      message: 'Upgrade to Premium Landlord to view exact score and history',
    };
  }

  @Get('tenant/:tenantId/full')
  @UseGuards(RolesGuard, TierGuard)
  @Roles(UserRole.LANDLORD)
  @RequireTier('PREMIUM_LANDLORD')
  @ApiOperation({ summary: 'Get full tenant credit score (Premium Landlord)' })
  async getTenantCreditScoreFull(@Param('tenantId') tenantId: string) {
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

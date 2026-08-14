import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('properties')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get recommended properties for the current tenant',
    description:
      'Returns a ranked list of properties tailored to the current tenant based on preferences and basic heuristics. This is a rules-based engine designed to be upgraded with ML models later.',
  })
  async getRecommendedProperties(
    @CurrentUser() user: any,
    @Query() query: GetRecommendationsDto,
  ) {
    return this.recommendationService.getPropertyRecommendationsForTenant(
      user.id,
      query,
    );
  }
}


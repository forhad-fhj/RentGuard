import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoreEventService } from './services/score-event.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateScoreEventDto } from './dto/create-score-event.dto';
import { DisputeScoreEventDto } from './dto/dispute-score-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ScoreEventType } from '@prisma/client';

const SCORE_DELTAS: Record<ScoreEventType, number> = {
  ON_TIME_PAYMENT: 10,
  LATE_PAYMENT: -15,
  DAMAGE: -25,
  DISPUTE: -20,
  LEASE_COMPLETED: 20,
};

@ApiTags('credit-score')
@Controller('credit-score/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScoreEventController {
  constructor(
    private readonly scoreEventService: ScoreEventService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Submit a score-affecting event (landlord/admin)',
    description:
      'Creates an immutable score event. Tenants may dispute via POST .../dispute.',
  })
  async createEvent(@CurrentUser() user: any, @Body() dto: CreateScoreEventDto) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.scoreEventService.createEvent({
      tenantId: dto.tenantId,
      type: dto.type,
      scoreDelta: SCORE_DELTAS[dto.type],
      submittedById: user.id,
      evidenceUrl: dto.evidenceUrl,
    });
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'List my score events (tenant)' })
  async listMyEvents(@CurrentUser() user: any) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.scoreEventService.listEventsForTenant(tenantProfile.id);
  }

  @Post(':id/dispute')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Dispute a score event (tenant right-of-reply)' })
  async disputeEvent(
    @Param('id') eventId: string,
    @CurrentUser() user: any,
    @Body() dto: DisputeScoreEventDto,
  ) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.scoreEventService.addTenantResponse(
      eventId,
      tenantProfile.id,
      dto.tenantResponse,
    );
  }

  @Post(':id/overturn')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Overturn a disputed score event (admin)' })
  async overturnEvent(@Param('id') eventId: string) {
    return this.scoreEventService.overturnEvent(
      eventId,
      'Admin overturned disputed event',
    );
  }
}

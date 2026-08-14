import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ScoreEvent,
  ScoreEventStatus,
  ScoreEventType,
  RiskCategory,
} from '@prisma/client';

@Injectable()
export class ScoreEventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: {
    tenantId: string;
    type: ScoreEventType;
    scoreDelta: number;
    submittedById: string;
    evidenceUrl?: string;
  }) {
    const event = await this.prisma.scoreEvent.create({
      data: {
        tenantId: data.tenantId,
        type: data.type,
        scoreDelta: data.scoreDelta,
        submittedById: data.submittedById,
        evidenceUrl: data.evidenceUrl,
        status: ScoreEventStatus.ACTIVE,
      },
    });

    await this.recalculateScore(data.tenantId, `Score event: ${data.type}`);
    return event;
  }

  async addTenantResponse(eventId: string, tenantId: string, response: string) {
    const event = await this.prisma.scoreEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Score event not found');
    }

    return this.prisma.scoreEvent.update({
      where: { id: eventId },
      data: {
        tenantResponse: response,
        status: ScoreEventStatus.DISPUTED,
      },
    });
  }

  async overturnEvent(eventId: string, reason: string) {
    const event = await this.prisma.scoreEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Score event not found');
    }

    await this.prisma.scoreEvent.update({
      where: { id: eventId },
      data: { status: ScoreEventStatus.OVERTURNED },
    });

    await this.recalculateScore(event.tenantId, reason);
    return event;
  }

  async listEventsForTenant(tenantId: string) {
    return this.prisma.scoreEvent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Recompute score from immutable events — transparent and auditable.
   */
  async recalculateScore(tenantId: string, reason?: string) {
    const baseScore = 600;
    const events = await this.prisma.scoreEvent.findMany({
      where: { tenantId, status: ScoreEventStatus.ACTIVE },
    });

    const deltaSum = events.reduce(
      (sum: number, e: ScoreEvent) => sum + e.scoreDelta,
      0,
    );
    const score = Math.max(0, Math.min(1000, baseScore + deltaSum));

    let riskCategory: RiskCategory = RiskCategory.MODERATE;
    if (score >= 750) riskCategory = RiskCategory.LOW;
    else if (score >= 500) riskCategory = RiskCategory.MODERATE;
    else if (score >= 350) riskCategory = RiskCategory.HIGH;
    else riskCategory = RiskCategory.VERY_HIGH;

    const creditScore = await this.prisma.creditScore.upsert({
      where: { tenantId },
      create: {
        tenantId,
        score,
        riskCategory,
        explanation: {
          baseScore,
          activeEvents: events.length,
          totalDelta: deltaSum,
          recalculatedAt: new Date().toISOString(),
        },
      },
      update: {
        score,
        riskCategory,
        lastCalculatedAt: new Date(),
        explanation: {
          baseScore,
          activeEvents: events.length,
          totalDelta: deltaSum,
          recalculatedAt: new Date().toISOString(),
        },
      },
    });

    await this.prisma.creditScoreHistory.create({
      data: {
        creditScoreId: creditScore.id,
        score,
        riskCategory,
        reason: reason || 'Recalculated from score events',
        metadata: { eventCount: events.length },
      },
    });

    return creditScore;
  }
}

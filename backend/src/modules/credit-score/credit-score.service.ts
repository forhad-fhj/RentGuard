import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreditScoreCalculator } from './services/credit-score-calculator.service';
import { RiskCategory } from '@prisma/client';

@Injectable()
export class CreditScoreService {
  constructor(
    private prisma: PrismaService,
    private calculator: CreditScoreCalculator,
  ) {}

  async getCreditScore(tenantId: string) {
    let creditScore = await this.prisma.creditScore.findUnique({
      where: { tenantId },
      include: {
        history: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!creditScore) {
      // Create initial credit score
      creditScore = await this.calculateAndCreate(tenantId);
    }

    return creditScore;
  }

  async calculateAndCreate(tenantId: string) {
    const scoreData = await this.calculator.calculateScore(tenantId);

    // Determine risk category
    const riskCategory = this.determineRiskCategory(scoreData.score);

    // Create or update credit score
    const creditScore = await this.prisma.creditScore.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...scoreData,
        riskCategory,
      },
      update: {
        ...scoreData,
        riskCategory,
        lastCalculatedAt: new Date(),
      },
      include: {
        history: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Save history
    await this.prisma.creditScoreHistory.create({
      data: {
        creditScoreId: creditScore.id,
        score: creditScore.score,
        riskCategory: creditScore.riskCategory,
        reason: 'Automatic recalculation',
      },
    });

    // Fetch again with history
    return this.prisma.creditScore.findUnique({
      where: { tenantId },
      include: {
        history: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async recalculateCreditScore(tenantId: string) {
    return this.calculateAndCreate(tenantId);
  }

  async getCreditScoreHistory(tenantId: string) {
    const creditScore = await this.prisma.creditScore.findUnique({
      where: { tenantId },
    });

    if (!creditScore) {
      throw new NotFoundException('Credit score not found');
    }

    return this.prisma.creditScoreHistory.findMany({
      where: { creditScoreId: creditScore.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private determineRiskCategory(score: number): RiskCategory {
    if (score >= 750) return RiskCategory.LOW;
    if (score >= 600) return RiskCategory.MODERATE;
    if (score >= 400) return RiskCategory.HIGH;
    return RiskCategory.VERY_HIGH;
  }
}

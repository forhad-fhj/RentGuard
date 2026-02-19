import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface CreditScoreData {
  score: number;
  paymentPunctuality: number;
  leaseCompletionRatio: number;
  disputeHistoryScore: number;
  propertyDamageScore: number;
  behavioralScore: number;
  identityConfidence: number;
  tenureStability: number;
  communityEndorsements: number;
  fraudProbability: number;
  reliabilityIndex: number;
  explanation: any;
}

@Injectable()
export class CreditScoreCalculator {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async calculateScore(tenantId: string): Promise<CreditScoreData> {
    // Fetch all relevant data
    const [
      paymentPunctuality,
      leaseCompletionRatio,
      disputeHistoryScore,
      propertyDamageScore,
      behavioralScore,
      identityConfidence,
      tenureStability,
      communityEndorsements,
    ] = await Promise.all([
      this.calculatePaymentPunctuality(tenantId),
      this.calculateLeaseCompletionRatio(tenantId),
      this.calculateDisputeHistoryScore(tenantId),
      this.calculatePropertyDamageScore(tenantId),
      this.calculateBehavioralScore(tenantId),
      this.calculateIdentityConfidence(tenantId),
      this.calculateTenureStability(tenantId),
      this.calculateCommunityEndorsements(tenantId),
    ]);

    // Calculate fraud probability
    const fraudProbability = await this.calculateFraudProbability(tenantId);

    // Weighted scoring (hybrid ML + rules)
    const weights = {
      paymentPunctuality: 0.25,
      leaseCompletionRatio: 0.20,
      disputeHistoryScore: 0.15,
      propertyDamageScore: 0.10,
      behavioralScore: 0.10,
      identityConfidence: 0.10,
      tenureStability: 0.05,
      communityEndorsements: 0.05,
    };

    const baseScore =
      paymentPunctuality * weights.paymentPunctuality +
      leaseCompletionRatio * weights.leaseCompletionRatio +
      disputeHistoryScore * weights.disputeHistoryScore +
      propertyDamageScore * weights.propertyDamageScore +
      behavioralScore * weights.behavioralScore +
      identityConfidence * weights.identityConfidence +
      tenureStability * weights.tenureStability +
      communityEndorsements * weights.communityEndorsements;

    // Apply fraud penalty
    const fraudPenalty = fraudProbability * 200; // Max 200 point penalty
    const finalScore = Math.max(0, Math.min(1000, baseScore * 1000 - fraudPenalty));

    // Calculate reliability index
    const reliabilityIndex =
      (paymentPunctuality +
        leaseCompletionRatio +
        (1 - disputeHistoryScore) +
        (1 - propertyDamageScore) +
        behavioralScore) /
      5;

    const explanation = {
      components: {
        paymentPunctuality,
        leaseCompletionRatio,
        disputeHistoryScore,
        propertyDamageScore,
        behavioralScore,
        identityConfidence,
        tenureStability,
        communityEndorsements,
      },
      fraudProbability,
      fraudPenalty,
      baseScore: baseScore * 1000,
      finalScore,
    };

    return {
      score: Math.round(finalScore),
      paymentPunctuality,
      leaseCompletionRatio,
      disputeHistoryScore,
      propertyDamageScore,
      behavioralScore,
      identityConfidence,
      tenureStability,
      communityEndorsements,
      fraudProbability,
      reliabilityIndex,
      explanation,
    };
  }

  private async calculatePaymentPunctuality(tenantId: string): Promise<number> {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { dueDate: 'desc' },
      take: 12, // Last 12 payments
    });

    if (payments.length === 0) return 0.5; // Default neutral score

    const onTimePayments = payments.filter(
      (p: any) => p.status === 'COMPLETED' && p.paidAt && p.paidAt <= p.dueDate,
    ).length;

    return onTimePayments / payments.length;
  }

  private async calculateLeaseCompletionRatio(tenantId: string): Promise<number> {
    const leases = await this.prisma.lease.findMany({
      where: { tenantId },
    });

    if (leases.length === 0) return 0.5;

    const completedLeases = leases.filter(
      (l: any) => l.status === 'EXPIRED' && !l.terminatedAt,
    ).length;

    return completedLeases / leases.length;
  }

  private async calculateDisputeHistoryScore(tenantId: string): Promise<number> {
    const disputes = await this.prisma.dispute.findMany({
      where: { tenantId },
    });

    if (disputes.length === 0) return 0.0; // No disputes = good

    const resolvedDisputes = disputes.filter(
      (d: any) => d.status === 'RESOLVED' || d.status === 'CLOSED',
    ).length;

    // Lower score = more disputes
    return Math.min(1.0, disputes.length / 10);
  }

  private async calculatePropertyDamageScore(tenantId: string): Promise<number> {
    // Check disputes related to property damage
    const damageDisputes = await this.prisma.dispute.findMany({
      where: {
        tenantId,
        type: 'PROPERTY_DAMAGE',
      },
    });

    // Lower score = more damage reports
    return Math.max(0.0, 1.0 - damageDisputes.length / 5);
  }

  private async calculateBehavioralScore(tenantId: string): Promise<number> {
    // Check for behavioral complaints
    const behavioralDisputes = await this.prisma.dispute.findMany({
      where: {
        tenantId,
        type: 'HARASSMENT',
      },
    });

    return Math.max(0.0, 1.0 - behavioralDisputes.length / 3);
  }

  private async calculateIdentityConfidence(tenantId: string): Promise<number> {
    const user = await this.prisma.user.findFirst({
      where: {
        tenantProfile: {
          id: tenantId,
        },
      },
      include: {
        tenantProfile: true,
      },
    });

    if (!user || !user.isKycVerified) return 0.3;

    const verification = await this.prisma.identityVerification.findUnique({
      where: { userId: user.id },
    });

    if (!verification) return 0.5;

    // Use face match and liveness scores
    const faceScore = verification.faceMatchScore || 0;
    const livenessScore = verification.livenessScore || 0;

    return (faceScore + livenessScore) / 2;
  }

  private async calculateTenureStability(tenantId: string): Promise<number> {
    const leases = await this.prisma.lease.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });

    if (leases.length === 0) return 0.5;

    // Calculate average lease duration
    const durations = leases.map((lease: any) => {
      const end = lease.endDate || new Date();
      return (end.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30); // Months
    });

    const avgDuration = durations.reduce((a: number, b: number) => a + b, 0) / durations.length;

    // Normalize to 0-1 (12+ months = 1.0)
    return Math.min(1.0, avgDuration / 12);
  }

  private async calculateCommunityEndorsements(tenantId: string): Promise<number> {
    const reviews = await this.prisma.review.findMany({
      where: { tenantId },
    });

    if (reviews.length === 0) return 0.0;

    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    // Normalize 1-5 rating to 0-1
    return (avgRating - 1) / 4;
  }

  private async calculateFraudProbability(tenantId: string): Promise<number> {
    const fraudSignals = await this.prisma.fraudSignal.findMany({
      where: { tenantId, isResolved: false },
    });

    if (fraudSignals.length === 0) return 0.0;

    // Calculate weighted fraud probability based on signal severity
    const severityWeights = {
      LOW: 0.1,
      MEDIUM: 0.3,
      HIGH: 0.6,
      CRITICAL: 1.0,
    };

    const totalWeight = fraudSignals.reduce(
      (sum: number, signal: any) => sum + (severityWeights[signal.severity as keyof typeof severityWeights] || 0),
      0,
    );

    return Math.min(1.0, totalWeight / fraudSignals.length);
  }
}

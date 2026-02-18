import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FraudSignalType, FraudSeverity } from '@prisma/client';

@Injectable()
export class FraudService {
  constructor(private prisma: PrismaService) {}

  async createFraudSignal(data: {
    tenantId?: string;
    userId?: string;
    signalType: FraudSignalType;
    severity: FraudSeverity;
    description: string;
    metadata?: any;
  }) {
    return this.prisma.fraudSignal.create({
      data,
    });
  }

  async detectMultipleAccounts(userId: string) {
    // Check for multiple accounts with same NID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantProfile: true,
      },
    });

    if (!user) return null;

    const verification = await this.prisma.identityVerification.findUnique({
      where: { userId },
    });

    if (!verification) return null;

    // Find other verifications with same NID
    const duplicateVerifications = await this.prisma.identityVerification.findMany({
      where: {
        nidNumber: verification.nidNumber,
        userId: { not: userId },
      },
    });

    if (duplicateVerifications.length > 0) {
      await this.createFraudSignal({
        userId,
        signalType: FraudSignalType.MULTIPLE_ACCOUNTS,
        severity: FraudSeverity.HIGH,
        description: `Multiple accounts detected with same NID: ${verification.nidNumber}`,
        metadata: {
          duplicateUserIds: duplicateVerifications.map((v) => v.userId),
        },
      });

      return true;
    }

    return false;
  }

  async getAllFraudSignals(filters?: { severity?: FraudSeverity; isResolved?: boolean }) {
    const where: any = {};

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.isResolved !== undefined) {
      where.isResolved = filters.isResolved;
    }

    return this.prisma.fraudSignal.findMany({
      where,
      include: {
        tenant: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

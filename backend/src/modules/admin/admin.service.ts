import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProperties,
      activeLeases,
      pendingVerifications,
      totalPayments,
      openDisputes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count({ where: { isAvailable: true } }),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
      this.prisma.identityVerification.count({
        where: { verificationStatus: 'PENDING' },
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      totalUsers,
      totalProperties,
      activeLeases,
      pendingVerifications,
      totalPayments,
      openDisputes,
    };
  }

  async suspendUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
      },
    });
  }

  async unsuspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
      },
    });
  }

  async getPendingProfileVerifications() {
    const [tenants, landlords] = await Promise.all([
      this.prisma.tenantProfile.findMany({
        where: {
          profileVerificationStatus: { in: ['SELFIE_ONLY', 'PENDING_NID'] },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.landlordProfile.findMany({
        where: {
          profileVerificationStatus: { in: ['SELFIE_ONLY', 'PENDING_NID'] },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return { tenants, landlords, total: tenants.length + landlords.length };
  }

  async approveProfileVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenantProfile: true, landlordProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.tenantProfile) {
      await this.prisma.tenantProfile.update({
        where: { userId },
        data: { profileVerificationStatus: 'VERIFIED' },
      });
    }

    if (user.landlordProfile) {
      await this.prisma.landlordProfile.update({
        where: { userId },
        data: {
          profileVerificationStatus: 'VERIFIED',
          verificationStatus: 'APPROVED',
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isKycVerified: true },
    });

    return { userId, status: 'VERIFIED' };
  }
}

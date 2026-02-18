import { Injectable } from '@nestjs/common';
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
}

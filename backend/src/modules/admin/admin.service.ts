import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReviewFlagReason, ReviewFlagStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProperties,
      activeLeases,
      openReviewFlags,
      totalPayments,
      openDisputes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.lease.count({ where: { status: 'ACTIVE' } }),
      this.prisma.reviewFlag.count({ where: { status: 'OPEN' } }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      totalUsers,
      totalProperties,
      activeLeases,
      pendingVerifications: openReviewFlags,
      totalPayments,
      openDisputes,
    };
  }

  async suspendUser(userId: string, _reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });
  }

  async unsuspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });
  }

  async getReviewQueue() {
    const flags = await this.prisma.reviewFlag.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = [...new Set(flags.map((f) => f.targetUserId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return flags.map((flag) => {
      const user = userMap.get(flag.targetUserId);
      const profile = user?.tenantProfile || user?.landlordProfile;
      return {
        ...flag,
        user: user
          ? {
              id: user.id,
              email: user.email,
              phone: user.phone,
              role: user.role,
              createdAt: user.createdAt,
              fullName: profile?.fullName,
              selfieUrl: profile?.selfieUrl,
              profileVerificationStatus: profile?.profileVerificationStatus,
            }
          : null,
      };
    });
  }

  async getUserForReview(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = user.tenantProfile || user.landlordProfile;
    const openFlags = await this.prisma.reviewFlag.findMany({
      where: { targetUserId: userId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      fullName: profile?.fullName,
      selfieUrl: profile?.selfieUrl,
      ownershipDocUrl: user.landlordProfile?.ownershipDocUrl,
      profileVerificationStatus: profile?.profileVerificationStatus,
      openFlags,
    };
  }

  async updateReviewFlag(
    flagId: string,
    adminId: string,
    data: { status: ReviewFlagStatus; notes?: string; markReviewed?: boolean },
  ) {
    const flag = await this.prisma.reviewFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException('Review flag not found');
    }

    if (flag.status !== 'OPEN') {
      throw new BadRequestException('This flag is already closed');
    }

    const updated = await this.prisma.reviewFlag.update({
      where: { id: flagId },
      data: {
        status: data.status,
        notes: data.notes,
        reviewedById: adminId,
      },
    });

    if (data.markReviewed && data.status === 'RESOLVED') {
      await this.markProfileReviewed(flag.targetUserId);
    }

    return updated;
  }

  async flagUser(
    targetUserId: string,
    reason: ReviewFlagReason,
    notes?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.reviewFlag.create({
      data: {
        targetUserId,
        reason,
        notes,
      },
    });
  }

  async markProfileReviewed(userId: string) {
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
        data: { profileVerificationStatus: 'ADMIN_REVIEWED' },
      });
    }

    if (user.landlordProfile) {
      await this.prisma.landlordProfile.update({
        where: { userId },
        data: { profileVerificationStatus: 'ADMIN_REVIEWED' },
      });
    }

    await this.prisma.reviewFlag.updateMany({
      where: { targetUserId: userId, status: 'OPEN', reason: 'SELFIE_QUALITY' },
      data: { status: 'RESOLVED' },
    });

    return { userId, status: 'ADMIN_REVIEWED' };
  }

  /** @deprecated Use review-queue flow with ADMIN_REVIEWED status */
  async getPendingProfileVerifications() {
    return this.getReviewQueue();
  }

  /** @deprecated Use updateReviewFlag with markReviewed */
  async approveProfileVerification(userId: string) {
    return this.markProfileReviewed(userId);
  }
}

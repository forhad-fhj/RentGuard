import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(
    applicationId: string,
    userId: string,
    userRole: string,
    status: ApplicationStatus,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: { include: { landlord: true } },
        tenant: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isLandlord =
      userRole === 'LANDLORD' &&
      application.property.landlord.userId === userId;
    const isTenant = userRole === 'TENANT' && application.tenant.userId === userId;

    if (!isLandlord && !isTenant) {
      throw new ForbiddenException('Not authorized to update this application');
    }

    if (isTenant) {
      if (status !== 'WITHDRAWN') {
        throw new BadRequestException('Tenants can only withdraw applications');
      }
      if (application.status !== 'PENDING') {
        throw new BadRequestException('Only pending applications can be withdrawn');
      }
    }

    if (isLandlord) {
      if (status !== 'APPROVED' && status !== 'REJECTED') {
        throw new BadRequestException('Landlords can only accept or reject applications');
      }
      if (application.status !== 'PENDING') {
        throw new BadRequestException('Only pending applications can be reviewed');
      }
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
      },
      include: {
        property: { select: { id: true, title: true, city: true } },
        tenant: {
          select: {
            id: true,
            fullName: true,
            selfieUrl: true,
            profileVerificationStatus: true,
            creditScore: { select: { score: true } },
          },
        },
      },
    });
  }

  async findByTenant(tenantProfileId: string) {
    return this.prisma.application.findMany({
      where: { tenantId: tenantProfileId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            district: true,
            rentAmount: true,
            status: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

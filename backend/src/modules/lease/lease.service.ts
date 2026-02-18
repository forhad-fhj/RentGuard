import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { LeaseStatus } from '@prisma/client';

@Injectable()
export class LeaseService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaseDto: CreateLeaseDto) {
    // Generate unique lease number
    const leaseNumber = `LG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return this.prisma.lease.create({
      data: {
        ...createLeaseDto,
        leaseNumber,
        status: LeaseStatus.DRAFT,
      },
    });
  }

  async signLease(leaseId: string, userId: string, signature: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Determine if user is tenant or landlord
    const isTenant = lease.tenantId === userId;
    const isLandlord = lease.landlordId === userId;

    if (!isTenant && !isLandlord) {
      throw new ForbiddenException('Not authorized to sign this lease');
    }

    const updateData: any = {};

    if (isTenant) {
      updateData.tenantSignature = signature;
    }

    if (isLandlord) {
      updateData.landlordSignature = signature;
    }

    // If both signatures are present, mark as active
    const updatedLease = await this.prisma.lease.update({
      where: { id: leaseId },
      data: {
        ...updateData,
        signedAt: new Date(),
        status:
          updateData.tenantSignature && updateData.landlordSignature
            ? LeaseStatus.ACTIVE
            : LeaseStatus.PENDING_SIGNATURE,
      },
    });

    // Create lease event
    await this.prisma.leaseEvent.create({
      data: {
        leaseId,
        eventType: 'SIGNED',
        description: `${isTenant ? 'Tenant' : 'Landlord'} signed the lease`,
      },
    });

    return updatedLease;
  }

  async findAll(userId: string, role: string) {
    const where: any = {};

    if (role === 'TENANT') {
      const tenantProfile = await this.prisma.tenantProfile.findUnique({
        where: { userId },
      });
      if (tenantProfile) {
        where.tenantId = tenantProfile.id;
      }
    } else if (role === 'LANDLORD') {
      const landlordProfile = await this.prisma.landlordProfile.findUnique({
        where: { userId },
      });
      if (landlordProfile) {
        where.landlordId = landlordProfile.id;
      }
    }

    return this.prisma.lease.findMany({
      where,
      include: {
        property: true,
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

  async findOne(id: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true,
        payments: true,
        disputes: true,
        leaseEvents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    return lease;
  }
}

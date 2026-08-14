import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: string, createPropertyDto: CreatePropertyDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { id: landlordId },
      include: {
        user: { select: { subscriptionTier: true } },
      },
    });

    if (!landlord) {
      throw new NotFoundException('Landlord profile not found');
    }

    if (landlord.user.subscriptionTier === 'FREE') {
      const activeCount = await this.prisma.property.count({
        where: { landlordId, isAvailable: true },
      });
      if (activeCount >= 2) {
        throw new ForbiddenException(
          'Free tier is limited to 2 active listings. Upgrade to Premium Landlord for unlimited listings.',
        );
      }
    }

    return this.prisma.property.create({
      data: {
        ...createPropertyDto,
        landlordId,
      },
    });
  }

  async findAll(filters?: any) {
    const where: any = { isAvailable: true };

    if (filters?.city) where.city = filters.city;
    if (filters?.district) where.district = filters.district;
    if (filters?.propertyType) where.propertyType = filters.propertyType;
    if (filters?.minRent) where.rentAmount = { gte: filters.minRent };
    if (filters?.maxRent) {
      where.rentAmount = {
        ...where.rentAmount,
        lte: filters.maxRent,
      };
    }

    return this.prisma.property.findMany({
      where,
      include: {
        landlord: {
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
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
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
        leases: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, landlordId: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException('Not authorized to update this property');
    }

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });
  }

  async remove(id: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException('Not authorized to delete this property');
    }

    return this.prisma.property.update({
      where: { id },
      data: { isAvailable: false },
    });
  }

  async applyForProperty(propertyId: string, tenantId: string, message?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || !property.isAvailable) {
      throw new NotFoundException('Property not available');
    }

    // Check if already applied
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        propertyId,
        tenantId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingApplication) {
      throw new ForbiddenException('Already applied for this property');
    }

    return this.prisma.application.create({
      data: {
        propertyId,
        tenantId,
        message,
      },
    });
  }
}

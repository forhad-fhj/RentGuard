import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

    return this.prisma.property.create({
      data: {
        ...createPropertyDto,
        landlordId,
        status: 'DRAFT',
        isAvailable: false,
      },
    });
  }

  async findByLandlord(landlordId: string) {
    return this.prisma.property.findMany({
      where: { landlordId },
      include: {
        applications: {
          where: { status: 'PENDING' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(filters?: {
    city?: string;
    district?: string;
    propertyType?: string;
    minRent?: string | number;
    maxRent?: string | number;
    bedrooms?: string | number;
    page?: string | number;
    limit?: string | number;
  }) {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: 'ACTIVE' };

    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters?.district) where.district = filters.district;
    if (filters?.propertyType) where.propertyType = filters.propertyType;
    if (filters?.bedrooms) where.bedrooms = Number(filters.bedrooms);

    const rentFilter: Record<string, number> = {};
    if (filters?.minRent) rentFilter.gte = Number(filters.minRent);
    if (filters?.maxRent) rentFilter.lte = Number(filters.maxRent);
    if (Object.keys(rentFilter).length > 0) where.rentAmount = rentFilter;

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          landlord: {
            select: {
              id: true,
              fullName: true,
              profileVerificationStatus: true,
            },
          },
        },
        orderBy: [{ isPremiumListing: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async publish(id: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        landlord: { include: { user: { select: { subscriptionTier: true } } } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException('Not authorized to publish this property');
    }

    const missing: string[] = [];
    if (!property.title?.trim()) missing.push('title');
    if (!property.description?.trim()) missing.push('description');
    if (!property.address?.trim()) missing.push('address');
    if (!property.city?.trim()) missing.push('city');
    if (!property.rentAmount) missing.push('rentAmount');
    if (!property.bedrooms && property.bedrooms !== 0) missing.push('bedrooms');
    if (!property.bathrooms && property.bathrooms !== 0) missing.push('bathrooms');
    if (!property.images?.length) missing.push('at least 1 photo');

    if (missing.length > 0) {
      throw new BadRequestException(
        `Cannot publish — missing required fields: ${missing.join(', ')}`,
      );
    }

    if (property.landlord.user.subscriptionTier === 'FREE') {
      const activeCount = await this.prisma.property.count({
        where: { landlordId, status: 'ACTIVE' },
      });
      if (activeCount >= 2) {
        throw new ForbiddenException(
          'Free tier is limited to 2 active listings. Upgrade to Premium Landlord for unlimited listings.',
        );
      }
    }

    return this.prisma.property.update({
      where: { id },
      data: { status: 'ACTIVE', isAvailable: true },
    });
  }

  async archive(id: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException('Not authorized to archive this property');
    }

    return this.prisma.property.update({
      where: { id },
      data: { status: 'ARCHIVED', isAvailable: false },
    });
  }

  async getApplications(propertyId: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException('Not authorized to view applicants');
    }

    return this.prisma.application.findMany({
      where: { propertyId },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            selfieUrl: true,
            profileVerificationStatus: true,
            creditScore: { select: { score: true, riskCategory: true } },
            user: { select: { email: true, phone: true } },
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
      data: { status: 'ARCHIVED', isAvailable: false },
    });
  }

  async applyForProperty(propertyId: string, tenantId: string, message?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.status !== 'ACTIVE') {
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

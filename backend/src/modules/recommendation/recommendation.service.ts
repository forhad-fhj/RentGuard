import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPropertyRecommendationsForTenant(userId: string, filters: GetRecommendationsDto) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId },
      include: {
        creditScore: true,
        fraudSignals: true,
      },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    const where: any = { isAvailable: true };

    if (filters.city) where.city = filters.city;
    if (filters.district) where.district = filters.district;
    if (filters.area) where.area = filters.area;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.minRent) where.rentAmount = { gte: filters.minRent };
    if (filters.maxRent) {
      where.rentAmount = {
        ...(where.rentAmount || {}),
        lte: filters.maxRent,
      };
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        landlord: true,
        leases: {
          where: {
            status: 'ACTIVE',
          },
        },
        applications: true,
      },
    });

    const tenantFraudSignalCount = tenantProfile.fraudSignals
      ? tenantProfile.fraudSignals.length
      : 0;

    const scored = properties.map((property: any) => {
      const score = this.computePropertyScore({
        property,
        tenantProfile,
        tenantFraudSignalCount,
      });
      return { property, score };
    });

    scored.sort((a: any, b: any) => b.score - a.score);

    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    return scored.slice(0, limit).map((item: any) => item.property);
  }

  private computePropertyScore(input: {
    property: any;
    tenantProfile: any;
    tenantFraudSignalCount: number;
  }): number {
    const { property, tenantProfile, tenantFraudSignalCount } = input;

    let score = 0;

    // Location preference: boost if property is in preferred locations
    const preferredLocations: string[] = tenantProfile.preferredLocations || [];
    if (preferredLocations.length > 0) {
      const locationMatch = [property.city, property.district, property.area]
        .filter(Boolean)
        .map((v: any) => String(v).toLowerCase());

      const hasMatch = preferredLocations.some((loc: string) =>
        locationMatch.includes(loc.toLowerCase()),
      );

      if (hasMatch) {
        score += 20;
      }
    }

    // Price suitability: prefer properties whose rent is closer to median of requested range
    const rent = Number(property.rentAmount || 0);
    const minRent = typeof tenantProfile.minPreferredRent === 'number'
      ? tenantProfile.minPreferredRent
      : undefined;
    const maxRent = typeof tenantProfile.maxPreferredRent === 'number'
      ? tenantProfile.maxPreferredRent
      : undefined;

    if (minRent !== undefined && maxRent !== undefined && rent > 0) {
      const target = (minRent + maxRent) / 2;
      const diff = Math.abs(rent - target);
      const tolerance = target * 0.5; // 50% band
      const priceScore = Math.max(0, 20 - (diff / tolerance) * 20);
      score += priceScore;
    }

    // Basic property quality heuristic
    const bedrooms = property.bedrooms || 0;
    const bathrooms = property.bathrooms || 0;
    const hasAmenities = Array.isArray(property.amenities)
      ? property.amenities.length
      : 0;

    score += bedrooms * 2;
    score += bathrooms;
    score += Math.min(hasAmenities, 10); // cap amenity boost

    // Demand and competition: fewer active applications is slightly better
    const activeApplications = Array.isArray(property.applications)
      ? property.applications.filter((a: any) => a.status === 'PENDING').length
      : 0;
    score -= activeApplications * 1.5;

    // Tenant risk: if tenant has many fraud signals, slightly reduce score
    if (tenantFraudSignalCount > 0) {
      score -= Math.min(tenantFraudSignalCount * 2, 20);
    }

    return score;
  }
}


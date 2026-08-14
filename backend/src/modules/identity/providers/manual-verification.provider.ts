import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  VerificationProvider,
  VerifyNIDInput,
  MatchFaceInput,
  VerificationResult,
  FaceMatchResult,
  VerificationStatusResult,
} from './verification-provider.interface';

/**
 * Stage 1 provider: no autonomous NID/OCR or face-match decisions.
 * Documents are stored; admins review manually via the admin panel (future).
 */
@Injectable()
export class ManualVerificationProvider implements VerificationProvider {
  readonly name = 'manual';

  constructor(private readonly prisma: PrismaService) {}

  async verifyNID(_input: VerifyNIDInput): Promise<VerificationResult> {
    return {
      status: 'PENDING',
      message: 'NID submitted for manual review by RentGuard admins',
    };
  }

  async matchFace(_input: MatchFaceInput): Promise<FaceMatchResult> {
    return {
      matched: false,
      confidence: 0,
    };
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatusResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    });

    if (!user) {
      return { status: 'UNKNOWN', provider: this.name };
    }

    const profile =
      user.tenantProfile?.profileVerificationStatus ||
      user.landlordProfile?.profileVerificationStatus ||
      'SELFIE_ONLY';

    return {
      status: profile,
      provider: this.name,
    };
  }
}

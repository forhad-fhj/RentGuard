import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { S3Service } from '../s3/s3.service';
import { OcrService } from './services/ocr.service';
import { BiometricService } from './services/biometric.service';
import { VerificationStatus } from '@prisma/client';
import { CreateIdentityVerificationDto } from './dto/create-identity-verification.dto';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private encryptionUtil: EncryptionUtil,
    private s3Service: S3Service,
    private ocrService: OcrService,
    private biometricService: BiometricService,
  ) {}

  async createVerification(
    userId: string,
    dto: CreateIdentityVerificationDto,
  ) {
    // Check if user already has verification
    const existing = await this.prisma.identityVerification.findUnique({
      where: { userId },
    });

    if (existing && existing.verificationStatus === VerificationStatus.APPROVED) {
      throw new BadRequestException('User already verified');
    }

    // Upload images to S3
    const nidFrontUrl = await this.s3Service.uploadFile(
      dto.nidFrontImage,
      `identity/${userId}/nid-front-${Date.now()}.jpg`,
    );
    const nidBackUrl = await this.s3Service.uploadFile(
      dto.nidBackImage,
      `identity/${userId}/nid-back-${Date.now()}.jpg`,
    );
    const selfieUrl = await this.s3Service.uploadFile(
      dto.selfieImage,
      `identity/${userId}/selfie-${Date.now()}.jpg`,
    );

    // Extract NID data using OCR
    const ocrResult = await this.ocrService.extractNidData(nidFrontUrl);
    const nidNumber = ocrResult.nidNumber || dto.nidNumber;

    // Encrypt NID number
    const nidEncrypted = this.encryptionUtil.encrypt(nidNumber);

    // Perform face matching
    const faceMatchResult = await this.biometricService.matchFaces(
      selfieUrl,
      ocrResult.photoUrl || nidFrontUrl,
    );

    // Generate biometric template
    const biometricTemplate = await this.biometricService.generateTemplate(
      selfieUrl,
    );
    const encryptedTemplate = this.encryptionUtil.encrypt(biometricTemplate);

    // Check for liveness
    const livenessScore = await this.biometricService.detectLiveness(selfieUrl);

    // Create verification record
    const verification = await this.prisma.identityVerification.create({
      data: {
        userId,
        nidNumber,
        nidEncrypted,
        nidFrontImage: nidFrontUrl,
        nidBackImage: nidBackUrl,
        selfieImage: selfieUrl,
        nidOcrData: ocrResult as any,
        nidOcrConfidence: ocrResult.confidence,
        biometricTemplate: encryptedTemplate,
        faceMatchScore: faceMatchResult.score,
        livenessScore,
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    // Auto-approve if scores are high enough
    if (
      faceMatchResult.score >= 0.8 &&
      livenessScore >= 0.7 &&
      ocrResult.confidence >= 0.8
    ) {
      await this.approveVerification(verification.id, 'system');
    }

    return verification;
  }

  async approveVerification(verificationId: string, adminId: string) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    const updated = await this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        verificationStatus: VerificationStatus.APPROVED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    // Update user KYC status
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isKycVerified: true },
    });

    return updated;
  }

  async rejectVerification(
    verificationId: string,
    adminId: string,
    reason: string,
  ) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    return this.prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async getVerification(userId: string) {
    const verification = await this.prisma.identityVerification.findUnique({
      where: { userId },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    return verification;
  }

  async getAllPendingVerifications() {
    return this.prisma.identityVerification.findMany({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

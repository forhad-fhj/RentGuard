import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { S3Module } from '../s3/s3.module';
import { OcrService } from './services/ocr.service';
import { BiometricService } from './services/biometric.service';
import { ManualVerificationProvider } from './providers/manual-verification.provider';
import { VERIFICATION_PROVIDER } from './providers/verification-provider.interface';

@Module({
  imports: [ConfigModule, PrismaModule, S3Module],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    EncryptionUtil,
    OcrService,
    BiometricService,
    ManualVerificationProvider,
    {
      provide: VERIFICATION_PROVIDER,
      useClass: ManualVerificationProvider,
    },
  ],
  exports: [IdentityService, VERIFICATION_PROVIDER],
})
export class IdentityModule {}

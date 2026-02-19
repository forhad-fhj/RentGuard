import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { S3Module } from '../s3/s3.module';
import { OcrService } from './services/ocr.service';
import { BiometricService } from './services/biometric.service';

@Module({
  imports: [ConfigModule, PrismaModule, S3Module],
  controllers: [IdentityController],
  providers: [IdentityService, EncryptionUtil, OcrService, BiometricService],
  exports: [IdentityService],
})
export class IdentityModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';

// Configuration
import configuration from './config/configuration';

// Core Modules
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CreditScoreModule } from './modules/credit-score/credit-score.module';
import { PropertyModule } from './modules/property/property.module';
import { LeaseModule } from './modules/lease/lease.module';
import { PaymentModule } from './modules/payment/payment.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('RATE_LIMIT_TTL') || 60,
        limit: config.get('RATE_LIMIT_MAX') || 100,
      }),
    }),

    // Event Emitter
    EventEmitterModule.forRoot(),

    // BullMQ (Job Queue)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get('REDIS_PORT') || 6379,
        },
      }),
    }),

    // Core Modules
    PrismaModule,
    AuthModule,
    IdentityModule,
    CreditScoreModule,
    PropertyModule,
    LeaseModule,
    PaymentModule,
    DisputeModule,
    FraudModule,
    AdminModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

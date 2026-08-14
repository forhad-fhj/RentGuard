import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}


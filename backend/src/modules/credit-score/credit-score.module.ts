import { Module } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { CreditScoreController } from './credit-score.controller';
import { ScoreEventController } from './score-event.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CreditScoreCalculator } from './services/credit-score-calculator.service';
import { ScoreEventService } from './services/score-event.service';
import { TierGuard } from '../../common/guards/tier.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CreditScoreController, ScoreEventController],
  providers: [CreditScoreService, CreditScoreCalculator, ScoreEventService, TierGuard],
  exports: [CreditScoreService, ScoreEventService],
})
export class CreditScoreModule {}

import { Module } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { CreditScoreController } from './credit-score.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CreditScoreCalculator } from './services/credit-score-calculator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CreditScoreController],
  providers: [CreditScoreService, CreditScoreCalculator],
  exports: [CreditScoreService],
})
export class CreditScoreModule {}

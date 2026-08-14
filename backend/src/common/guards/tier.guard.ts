import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { REQUIRE_TIER_KEY } from '../decorators/require-tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTiers = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTiers?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user || !requiredTiers.includes(user.subscriptionTier)) {
      throw new ForbiddenException(
        `This feature requires one of: ${requiredTiers.join(', ')}`,
      );
    }

    return true;
  }
}

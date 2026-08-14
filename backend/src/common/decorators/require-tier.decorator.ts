import { SetMetadata } from '@nestjs/common';

export const REQUIRE_TIER_KEY = 'requireTier';

/** Require one of the subscription tiers (e.g. PREMIUM_TENANT, PREMIUM_LANDLORD) */
export const RequireTier = (...tiers: string[]) => SetMetadata(REQUIRE_TIER_KEY, tiers);

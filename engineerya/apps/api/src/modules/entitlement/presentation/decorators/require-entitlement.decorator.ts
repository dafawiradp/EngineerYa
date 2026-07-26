import { SetMetadata } from "@nestjs/common";
import { EntitlementType } from "@engineerya/shared-types";

export const REQUIRE_ENTITLEMENT_KEY = "requireEntitlement";

/**
 * @RequireEntitlement(EntitlementType.READ) on a route whose :bookId
 * param names the book being accessed. Must be combined with
 * @UseGuards(JwtAuthGuard, EntitlementGuard) — the guard reads this
 * metadata and the route param, not the other way around.
 */
export const RequireEntitlement = (type: EntitlementType) => SetMetadata(REQUIRE_ENTITLEMENT_KEY, type);

import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EntitlementType } from "@engineerya/shared-types";
import { ENTITLEMENT_REPOSITORY, IEntitlementRepository } from "../../domain/repositories/entitlement.repository";
import { REQUIRE_ENTITLEMENT_KEY } from "../decorators/require-entitlement.decorator";
import { IMembershipAccessChecker, MEMBERSHIP_ACCESS_CHECKER } from "../../../../common/ports/membership-access.port";

/**
 * Runs AFTER JwtAuthGuard (needs req.user already populated). Reads the
 * required EntitlementType from @RequireEntitlement() metadata and the
 * target book id from the route's :bookId param, then checks the DB.
 *
 * This is the guard referenced (as a TODO) throughout Phases 5-7's
 * Reader code — it now actually gates those routes, see reader.module.ts.
 *
 * READ access has a second path: an active membership grants READ to
 * every book WITHOUT a per-book Entitlement row being created for each
 * one (that would mean writing thousands of rows per subscriber, and
 * they'd all need cleanup on expiry). DOWNLOAD access has no membership
 * fallback — per the original spec, downloads always come from an
 * actual Purchase.
 */
@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ENTITLEMENT_REPOSITORY) private readonly entitlements: IEntitlementRepository,
    @Inject(MEMBERSHIP_ACCESS_CHECKER) private readonly membershipAccess: IMembershipAccessChecker
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredType = this.reflector.getAllAndOverride<EntitlementType | undefined>(
      REQUIRE_ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredType) {
      // No @RequireEntitlement() on this route — nothing to enforce.
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const bookId = request.params?.bookId;

    if (!user || !bookId) {
      throw new ForbiddenException("Unable to determine entitlement context for this request.");
    }

    const hasDirectEntitlement = await this.entitlements.exists(user.id, bookId, requiredType);
    const hasMembershipAccess =
      requiredType === EntitlementType.READ && !hasDirectEntitlement
        ? await this.membershipAccess.hasActiveMembership(user.id)
        : false;

    if (!hasDirectEntitlement && !hasMembershipAccess) {
      throw new ForbiddenException(
        requiredType === EntitlementType.DOWNLOAD
          ? "You need to purchase this book to download it."
          : "You need access to this book to read it. Purchase it or subscribe to a membership."
      );
    }

    return true;
  }
}

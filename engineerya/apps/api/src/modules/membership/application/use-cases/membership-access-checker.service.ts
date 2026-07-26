import { Inject, Injectable } from "@nestjs/common";
import { IMembershipAccessChecker } from "../../../../common/ports/membership-access.port";
import { MEMBERSHIP_REPOSITORY, IMembershipRepository } from "../../domain/repositories/membership.repository";

/**
 * Implements the shared port EntitlementGuard uses to ask "does this
 * user have membership-based access?", without EntitlementModule
 * needing to import anything from inside Membership's folder.
 */
@Injectable()
export class MembershipAccessCheckerService implements IMembershipAccessChecker {
  constructor(@Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: IMembershipRepository) {}

  async hasActiveMembership(userId: string): Promise<boolean> {
    const active = await this.memberships.findActiveForUser(userId);
    return active !== null;
  }
}

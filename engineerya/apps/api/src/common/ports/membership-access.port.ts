// Lives outside any single module so both Entitlement (consumer) and
// Membership (provider) depend on this shared port rather than on each
// other's internals. Entitlement imports MembershipModule at the Nest
// DI level to receive the binding; neither module's source imports
// from the other module's folder.

export interface IMembershipAccessChecker {
  hasActiveMembership(userId: string): Promise<boolean>;
}

export const MEMBERSHIP_ACCESS_CHECKER = Symbol("MEMBERSHIP_ACCESS_CHECKER");

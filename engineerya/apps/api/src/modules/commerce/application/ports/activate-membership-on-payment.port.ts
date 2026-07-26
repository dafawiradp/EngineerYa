// Commerce's webhook needs to activate a Membership on successful
// payment, but Commerce's application layer should not import
// Membership's use case class directly (that would make Commerce depend
// on Membership's internals). This port is the seam: Commerce depends
// only on this interface; MembershipModule provides the concrete binding
// (see membership.module.ts) and CommerceModule imports MembershipModule
// to receive it via DI. Membership never needs to know Commerce exists —
// still a one-way dependency, just crossing through an interface instead
// of a concrete class.

export type PaymentOutcome = "SUCCESS" | "FAILED" | "PENDING";

export interface IActivateMembershipOnPayment {
  execute(membershipId: string, outcome: PaymentOutcome): Promise<void>;
}

export const ACTIVATE_MEMBERSHIP_ON_PAYMENT = Symbol("ACTIVATE_MEMBERSHIP_ON_PAYMENT");

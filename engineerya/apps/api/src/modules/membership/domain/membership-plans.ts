// Single source of truth for available plans — pricing/duration lives
// here, not scattered across use cases or (worse) hardcoded in the DB.
//
// NOTE on naming: `priceCents` mirrors Book.priceCents — despite the
// name, it's used as a plain Rupiah integer amount throughout (see the
// currency note in CreatePurchaseUseCase), not actually subdivided into
// cents. Kept consistent with the existing field name rather than
// introducing a second convention.
export interface MembershipPlan {
  id: string;
  name: string;
  durationDays: number;
  priceCents: number;
}

export const MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  MONTHLY: { id: "MONTHLY", name: "Monthly", durationDays: 30, priceCents: 49_000 }, // Rp 49,000
  YEARLY: { id: "YEARLY", name: "Yearly", durationDays: 365, priceCents: 399_000 }, // Rp 399,000
};

export function getMembershipPlan(id: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS[id];
}

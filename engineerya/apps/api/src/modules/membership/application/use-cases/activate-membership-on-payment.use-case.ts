import { Inject, Injectable, Logger } from "@nestjs/common";
import { MEMBERSHIP_REPOSITORY, IMembershipRepository } from "../../domain/repositories/membership.repository";
import { getMembershipPlan } from "../../domain/membership-plans";
import {
  IActivateMembershipOnPayment,
  PaymentOutcome,
} from "../../../commerce/application/ports/activate-membership-on-payment.port";

/**
 * Implements Commerce's port (see activate-membership-on-payment.port.ts
 * for why this is a port rather than a direct import) — bound to that
 * token in membership.module.ts and consumed by CommerceModule's webhook
 * use case without CommerceModule ever importing this class directly.
 */
@Injectable()
export class ActivateMembershipOnPaymentUseCase implements IActivateMembershipOnPayment {
  private readonly logger = new Logger(ActivateMembershipOnPaymentUseCase.name);

  constructor(@Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: IMembershipRepository) {}

  async execute(membershipId: string, outcome: PaymentOutcome): Promise<void> {
    const membership = await this.memberships.findById(membershipId);
    if (!membership) {
      this.logger.warn(`Webhook for unknown membership ${membershipId}`);
      return;
    }

    if (outcome === "SUCCESS") {
      const plan = getMembershipPlan(membership.plan);
      const durationMs = (plan?.durationDays ?? 30) * 24 * 60 * 60 * 1000;
      await this.memberships.activate(membershipId, new Date(Date.now() + durationMs));
      this.logger.log(`Membership ${membershipId} activated`);
    } else if (outcome === "FAILED") {
      await this.memberships.updateStatus(membershipId, "CANCELLED");
    }
    // PENDING: leave as-is, a later webhook call resolves it.
  }
}

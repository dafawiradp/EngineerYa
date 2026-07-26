import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { MEMBERSHIP_REPOSITORY, IMembershipRepository } from "../../domain/repositories/membership.repository";
import { getMembershipPlan } from "../../domain/membership-plans";
import { MidtransService } from "../../../payment-gateway/infrastructure/midtrans.service";

export interface SubscribeMembershipCommand {
  userId: string;
  planId: string;
  userEmail: string;
  userName: string;
}

export interface SubscribeMembershipResult {
  membershipId: string;
  snapToken: string;
  redirectUrl: string;
}

@Injectable()
export class SubscribeMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: IMembershipRepository,
    private readonly midtrans: MidtransService
  ) {}

  async execute(command: SubscribeMembershipCommand): Promise<SubscribeMembershipResult> {
    const plan = getMembershipPlan(command.planId);
    if (!plan) {
      throw new BadRequestException(`Unknown plan "${command.planId}".`);
    }

    const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
    const membership = await this.memberships.create(command.userId, plan.id, expiresAt);

    // Same "book-"/"membership-" prefix routing convention used by
    // CreatePurchaseUseCase — see HandlePaymentWebhookUseCase.
    const snap = await this.midtrans.createSnapTransaction({
      orderId: `membership-${membership.id}`,
      grossAmount: plan.priceCents,
      customerEmail: command.userEmail,
      customerName: command.userName,
      itemName: `EngineerYa ${plan.name} Membership`,
    });

    return { membershipId: membership.id, snapToken: snap.token, redirectUrl: snap.redirectUrl };
  }
}

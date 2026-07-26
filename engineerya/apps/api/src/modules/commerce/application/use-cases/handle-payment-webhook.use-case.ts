import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EntitlementSource, EntitlementType, PaymentStatus, PurchaseStatus } from "@engineerya/shared-types";
import { PURCHASE_REPOSITORY, IPurchaseRepository } from "../../domain/repositories/purchase.repository";
import { PAYMENT_REPOSITORY, IPaymentRepository } from "../../domain/repositories/payment.repository";
import { MidtransNotification, MidtransService } from "../../../payment-gateway/infrastructure/midtrans.service";
import { GrantEntitlementUseCase } from "../../../entitlement/application/use-cases/grant-entitlement.use-case";
import {
  ACTIVATE_MEMBERSHIP_ON_PAYMENT,
  IActivateMembershipOnPayment,
} from "../ports/activate-membership-on-payment.port";

@Injectable()
export class HandlePaymentWebhookUseCase {
  private readonly logger = new Logger(HandlePaymentWebhookUseCase.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY) private readonly purchases: IPurchaseRepository,
    @Inject(PAYMENT_REPOSITORY) private readonly payments: IPaymentRepository,
    private readonly midtrans: MidtransService,
    private readonly grantEntitlement: GrantEntitlementUseCase,
    @Inject(ACTIVATE_MEMBERSHIP_ON_PAYMENT) private readonly activateMembership: IActivateMembershipOnPayment
  ) {}

  async execute(notification: MidtransNotification): Promise<void> {
    // The signature is the ONLY thing that makes this endpoint trustworthy
    // — it's a public URL, anyone can POST to it. Reject before touching
    // the database if it doesn't check out.
    if (!this.midtrans.verifySignature(notification)) {
      throw new UnauthorizedException("Invalid payment notification signature.");
    }

    const outcome = this.midtrans.interpretStatus(notification);

    if (notification.order_id.startsWith("membership-")) {
      const membershipId = notification.order_id.slice("membership-".length);
      await this.activateMembership.execute(membershipId, outcome);
      return;
    }

    if (!notification.order_id.startsWith("book-")) {
      this.logger.warn(`Webhook with unrecognized order_id format: ${notification.order_id}`);
      throw new NotFoundException("Order not found.");
    }

    const purchaseId = notification.order_id.slice("book-".length);
    const purchase = await this.purchases.findById(purchaseId);
    if (!purchase) {
      // Don't throw 500 on an unknown order_id — just log and 404, so
      // Midtrans doesn't retry forever on a notification that will
      // never resolve.
      this.logger.warn(`Webhook for unknown purchase ${purchaseId}`);
      throw new NotFoundException("Purchase not found.");
    }

    await this.payments.updateByPurchaseId(
      purchase.id,
      outcome === "SUCCESS" ? PaymentStatus.SUCCESS : outcome === "FAILED" ? PaymentStatus.FAILED : PaymentStatus.PENDING,
      notification.transaction_id ?? "",
      notification
    );

    if (outcome === "SUCCESS") {
      // Idempotent: safe even if this webhook fires twice for the same
      // order_id (Midtrans does retry), because updateStatus is a plain
      // write and grant() no-ops on an already-existing entitlement row.
      await this.purchases.updateStatus(purchase.id, PurchaseStatus.PAID);
      await this.grantEntitlement.execute(purchase.userId, purchase.bookId, EntitlementType.READ, EntitlementSource.PURCHASE);
      await this.grantEntitlement.execute(purchase.userId, purchase.bookId, EntitlementType.DOWNLOAD, EntitlementSource.PURCHASE);
      this.logger.log(`Purchase ${purchase.id} paid; entitlements granted to user ${purchase.userId}`);
    } else if (outcome === "FAILED") {
      await this.purchases.updateStatus(purchase.id, PurchaseStatus.FAILED);
    }
    // PENDING: leave the purchase as-is; a later webhook call will
    // resolve it to SUCCESS or FAILED.
  }
}

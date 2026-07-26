import { PaymentStatus } from "@engineerya/shared-types";

export interface IPaymentRepository {
  create(purchaseId: string, providerRef: string | null): Promise<void>;
  updateByPurchaseId(purchaseId: string, status: PaymentStatus, providerRef: string, rawPayload: unknown): Promise<void>;
}

export const PAYMENT_REPOSITORY = Symbol("PAYMENT_REPOSITORY");

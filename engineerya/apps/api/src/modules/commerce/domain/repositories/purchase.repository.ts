import { PurchaseStatus } from "@engineerya/shared-types";
import { PurchaseEntity } from "../entities/purchase.entity";

export interface IPurchaseRepository {
  findById(id: string): Promise<PurchaseEntity | null>;
  listForUser(userId: string): Promise<PurchaseEntity[]>;
  create(userId: string, bookId: string, priceCents: number): Promise<PurchaseEntity>;
  updateStatus(id: string, status: PurchaseStatus): Promise<PurchaseEntity>;
  /** Guards against double-charging: an already-PAID purchase for the
   * same user+book means "you already own this." */
  findActivePurchase(userId: string, bookId: string): Promise<PurchaseEntity | null>;
}

export const PURCHASE_REPOSITORY = Symbol("PURCHASE_REPOSITORY");

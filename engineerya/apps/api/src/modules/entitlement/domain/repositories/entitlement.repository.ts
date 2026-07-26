import { EntitlementSource, EntitlementType } from "@engineerya/shared-types";
import { EntitlementEntity } from "../entities/entitlement.entity";

export interface IEntitlementRepository {
  exists(userId: string, bookId: string, type: EntitlementType): Promise<boolean>;
  listForUser(userId: string): Promise<EntitlementEntity[]>;
  /**
   * Idempotent by design (relies on the DB's unique(userId, bookId, type)
   * constraint) — safe to call multiple times for the same grant, which
   * matters because payment webhooks can be retried by the provider.
   */
  grant(userId: string, bookId: string, type: EntitlementType, source: EntitlementSource): Promise<void>;
}

export const ENTITLEMENT_REPOSITORY = Symbol("ENTITLEMENT_REPOSITORY");

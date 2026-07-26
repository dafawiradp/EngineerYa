import { Inject, Injectable } from "@nestjs/common";
import { EntitlementSource, EntitlementType } from "@engineerya/shared-types";
import { ENTITLEMENT_REPOSITORY, IEntitlementRepository } from "../../domain/repositories/entitlement.repository";

@Injectable()
export class GrantEntitlementUseCase {
  constructor(@Inject(ENTITLEMENT_REPOSITORY) private readonly entitlements: IEntitlementRepository) {}

  execute(userId: string, bookId: string, type: EntitlementType, source: EntitlementSource): Promise<void> {
    return this.entitlements.grant(userId, bookId, type, source);
  }
}

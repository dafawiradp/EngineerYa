import { Inject, Injectable } from "@nestjs/common";
import { EntitlementEntity } from "../../domain/entities/entitlement.entity";
import { ENTITLEMENT_REPOSITORY, IEntitlementRepository } from "../../domain/repositories/entitlement.repository";

@Injectable()
export class ListEntitlementsUseCase {
  constructor(@Inject(ENTITLEMENT_REPOSITORY) private readonly entitlements: IEntitlementRepository) {}

  execute(userId: string): Promise<EntitlementEntity[]> {
    return this.entitlements.listForUser(userId);
  }
}

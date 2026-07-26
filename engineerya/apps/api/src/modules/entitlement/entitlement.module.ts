import { Module } from "@nestjs/common";
import { MembershipModule } from "../membership/membership.module";
import { ENTITLEMENT_REPOSITORY } from "./domain/repositories/entitlement.repository";
import { PrismaEntitlementRepository } from "./infrastructure/persistence/prisma-entitlement.repository";
import { GrantEntitlementUseCase } from "./application/use-cases/grant-entitlement.use-case";
import { ListEntitlementsUseCase } from "./application/use-cases/list-entitlements.use-case";
import { EntitlementGuard } from "./presentation/guards/entitlement.guard";

@Module({
  // EntitlementGuard needs MEMBERSHIP_ACCESS_CHECKER, which
  // MembershipModule provides — see entitlement.guard.ts.
  imports: [MembershipModule],
  providers: [
    { provide: ENTITLEMENT_REPOSITORY, useClass: PrismaEntitlementRepository },
    GrantEntitlementUseCase,
    ListEntitlementsUseCase,
    EntitlementGuard,
  ],
  // Exported so Commerce (grants on payment success) and Reader/Downloads
  // (EntitlementGuard) can both depend on this module without duplicating
  // any of it.
  exports: [ENTITLEMENT_REPOSITORY, GrantEntitlementUseCase, ListEntitlementsUseCase, EntitlementGuard],
})
export class EntitlementModule {}

import { Module } from "@nestjs/common";
import { PaymentGatewayModule } from "../payment-gateway/payment-gateway.module";
import { MEMBERSHIP_ACCESS_CHECKER } from "../../common/ports/membership-access.port";
import { ACTIVATE_MEMBERSHIP_ON_PAYMENT } from "../commerce/application/ports/activate-membership-on-payment.port";

import { MEMBERSHIP_REPOSITORY } from "./domain/repositories/membership.repository";
import { PrismaMembershipRepository } from "./infrastructure/persistence/prisma-membership.repository";

import { SubscribeMembershipUseCase } from "./application/use-cases/subscribe-membership.use-case";
import { GetMyMembershipUseCase } from "./application/use-cases/get-my-membership.use-case";
import { ActivateMembershipOnPaymentUseCase } from "./application/use-cases/activate-membership-on-payment.use-case";
import { MembershipAccessCheckerService } from "./application/use-cases/membership-access-checker.service";

import { MembershipsController } from "./presentation/controllers/memberships.controller";

@Module({
  imports: [PaymentGatewayModule],
  controllers: [MembershipsController],
  providers: [
    { provide: MEMBERSHIP_REPOSITORY, useClass: PrismaMembershipRepository },

    SubscribeMembershipUseCase,
    GetMyMembershipUseCase,

    // Bindings for the two shared ports this module fulfills — see
    // common/ports/membership-access.port.ts and
    // commerce/application/ports/activate-membership-on-payment.port.ts
    // for why these are ports rather than direct cross-module imports.
    { provide: MEMBERSHIP_ACCESS_CHECKER, useClass: MembershipAccessCheckerService },
    { provide: ACTIVATE_MEMBERSHIP_ON_PAYMENT, useClass: ActivateMembershipOnPaymentUseCase },
  ],
  exports: [MEMBERSHIP_REPOSITORY, MEMBERSHIP_ACCESS_CHECKER, ACTIVATE_MEMBERSHIP_ON_PAYMENT],
})
export class MembershipModule {}

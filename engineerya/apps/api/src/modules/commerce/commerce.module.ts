import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { StorageModule } from "../storage/storage.module";
import { WatermarkModule } from "../watermark/watermark.module";
import { EntitlementModule } from "../entitlement/entitlement.module";
import { PaymentGatewayModule } from "../payment-gateway/payment-gateway.module";
import { MembershipModule } from "../membership/membership.module";

import { PURCHASE_REPOSITORY } from "./domain/repositories/purchase.repository";
import { PAYMENT_REPOSITORY } from "./domain/repositories/payment.repository";
import { PrismaPurchaseRepository } from "./infrastructure/persistence/prisma-purchase.repository";
import { PrismaPaymentRepository } from "./infrastructure/persistence/prisma-payment.repository";

import { CreatePurchaseUseCase } from "./application/use-cases/create-purchase.use-case";
import { HandlePaymentWebhookUseCase } from "./application/use-cases/handle-payment-webhook.use-case";
import { ListPurchasesUseCase } from "./application/use-cases/list-purchases.use-case";
import { DownloadBookUseCase } from "./application/use-cases/download-book.use-case";

import { PurchasesController } from "./presentation/controllers/purchases.controller";
import { PaymentsController } from "./presentation/controllers/payments.controller";
import { DownloadsController } from "./presentation/controllers/downloads.controller";

@Module({
  imports: [
    CatalogModule,
    StorageModule,
    WatermarkModule,
    EntitlementModule,
    PaymentGatewayModule,
    // Needed so HandlePaymentWebhookUseCase can receive the
    // ACTIVATE_MEMBERSHIP_ON_PAYMENT binding — MembershipModule provides
    // it (see membership.module.ts), Commerce only depends on the port.
    MembershipModule,
  ],
  controllers: [PurchasesController, PaymentsController, DownloadsController],
  providers: [
    { provide: PURCHASE_REPOSITORY, useClass: PrismaPurchaseRepository },
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },

    CreatePurchaseUseCase,
    HandlePaymentWebhookUseCase,
    ListPurchasesUseCase,
    DownloadBookUseCase,
  ],
})
export class CommerceModule {}

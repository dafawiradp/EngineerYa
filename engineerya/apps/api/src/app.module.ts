import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { HealthController } from "./health.controller";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { SearchModule } from "./modules/search/search.module";
import { StorageModule } from "./modules/storage/storage.module";
import { ReaderModule } from "./modules/reader/reader.module";
import { EntitlementModule } from "./modules/entitlement/entitlement.module";
import { CommerceModule } from "./modules/commerce/commerce.module";
import { PaymentGatewayModule } from "./modules/payment-gateway/payment-gateway.module";
import { MembershipModule } from "./modules/membership/membership.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AdminAuditInterceptor } from "./modules/audit/infrastructure/admin-audit.interceptor";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // Global baseline rate limit; individual routes (reader, downloads)
    // tighten this further with their own @Throttle() overrides later.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    // Domain modules (Reader, Commerce, ...) are registered here one at
    // a time as each phase is implemented.
    IdentityModule,
    CatalogModule,
    SearchModule,
    StorageModule,
    ReaderModule,
    EntitlementModule,
    CommerceModule,
    PaymentGatewayModule,
    MembershipModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    // Runs after RequestLoggingInterceptor (registration order = execution
    // order for interceptors of the same scope); only writes an entry
    // for mutating /admin/... requests, see AdminAuditInterceptor.
    { provide: APP_INTERCEPTOR, useClass: AdminAuditInterceptor },
  ],
})
export class AppModule {}

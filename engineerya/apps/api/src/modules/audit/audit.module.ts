import { Global, Module } from "@nestjs/common";
import { AuditLogService } from "./infrastructure/audit-log.service";
import { AdminAuditInterceptor } from "./infrastructure/admin-audit.interceptor";

// @Global so AdminAuditInterceptor (registered as APP_INTERCEPTOR in
// AppModule) and AdminModule's audit-log viewer can both inject
// AuditLogService without every consumer re-importing this module.
@Global()
@Module({
  providers: [AuditLogService, AdminAuditInterceptor],
  exports: [AuditLogService, AdminAuditInterceptor],
})
export class AuditModule {}

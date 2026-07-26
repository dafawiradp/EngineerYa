import { Module } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { AnalyticsService } from "./infrastructure/analytics.service";
import { AdminUsersController } from "./presentation/controllers/admin-users.controller";
import { AdminAnalyticsController } from "./presentation/controllers/admin-analytics.controller";
import { AdminAuditLogsController } from "./presentation/controllers/admin-audit-logs.controller";

@Module({
  // AuditLogService comes from the @Global AuditModule, no import needed
  // here. IdentityModule is needed for USER_REPOSITORY.
  imports: [IdentityModule],
  controllers: [AdminUsersController, AdminAnalyticsController, AdminAuditLogsController],
  providers: [AnalyticsService],
})
export class AdminModule {}

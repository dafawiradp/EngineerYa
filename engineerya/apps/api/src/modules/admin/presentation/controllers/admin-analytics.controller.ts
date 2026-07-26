import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { AnalyticsService, AnalyticsOverview } from "../../infrastructure/analytics.service";

@Controller("admin/analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("overview")
  overview(): Promise<AnalyticsOverview> {
    return this.analytics.overview();
  }
}

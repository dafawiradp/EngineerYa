import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@engineerya/shared-types";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import { AuditLogService } from "../../../audit/infrastructure/audit-log.service";
import { PaginationQueryDto } from "../dto/pagination-query.dto";

@Controller("admin/audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditLogsController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.auditLog.list(query.page ?? 1, query.pageSize ?? 20);
  }
}

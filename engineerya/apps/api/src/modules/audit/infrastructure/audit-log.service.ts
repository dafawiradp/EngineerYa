import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@engineerya/database";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { AuditEntry } from "../domain/audit-entry";

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          ip: entry.ip,
        },
      });
    } catch (err) {
      // Audit logging must never take down the actual request it's
      // observing — log the failure and move on rather than rethrow.
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`);
    }
  }

  async list(page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total };
  }
}

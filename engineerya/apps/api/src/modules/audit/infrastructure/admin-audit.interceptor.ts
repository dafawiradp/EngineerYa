import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditLogService } from "./audit-log.service";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Applied globally (see app.module.ts), but only actually writes an
 * entry for mutating requests under /api/v1/admin/... — a single
 * centralized hook instead of a manual AuditLogService.record() call
 * threaded through every admin controller action individually. Logs
 * AFTER success (tap, not on error) — a failed/rejected admin action
 * isn't the thing we need a durable trail of; a successful one is.
 */
@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLog: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const isAdminRoute = typeof request.url === "string" && request.url.includes("/admin/");
    const isMutating = MUTATING_METHODS.has(request.method);

    if (!isAdminRoute || !isMutating) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.auditLog.record({
          actorId: request.user?.id ?? null,
          action: `${request.method} ${request.route?.path ?? request.url}`,
          targetType: this.inferTargetType(request.url),
          targetId: request.params?.id ?? request.params?.bookId ?? null,
          metadata: { body: this.redactSensitive(request.body) },
          ip: request.ip ?? null,
        });
      })
    );
  }

  private inferTargetType(url: string): string {
    const match = url.match(/\/admin\/([a-zA-Z-]+)/);
    return match ? match[1] : "unknown";
  }

  // Defense in depth: even though admin DTOs don't currently carry
  // password/secret fields, strip common sensitive key names before
  // persisting request bodies into the audit trail.
  private redactSensitive(body: unknown): unknown {
    if (!body || typeof body !== "object") return body;
    const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    for (const key of ["password", "token", "secret", "fileKey"]) {
      if (key in clone) clone[key] = "[REDACTED]";
    }
    return clone;
  }
}

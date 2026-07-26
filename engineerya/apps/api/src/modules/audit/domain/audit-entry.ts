export interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata?: unknown;
  ip: string | null;
}

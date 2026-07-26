export type MembershipStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export class MembershipEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly plan: string,
    public readonly status: MembershipStatus,
    public readonly startsAt: Date,
    public readonly expiresAt: Date
  ) {}

  get isCurrentlyActive(): boolean {
    return this.status === "ACTIVE" && this.expiresAt > new Date();
  }
}

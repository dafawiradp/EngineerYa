import { MembershipEntity, MembershipStatus } from "../entities/membership.entity";

export interface IMembershipRepository {
  findById(id: string): Promise<MembershipEntity | null>;
  findActiveForUser(userId: string): Promise<MembershipEntity | null>;
  create(userId: string, plan: string, expiresAt: Date): Promise<MembershipEntity>;
  updateStatus(id: string, status: MembershipStatus): Promise<MembershipEntity>;
  /**
   * Activates a PENDING membership and re-stamps its expiry window from
   * THIS moment — not from when the (possibly slow) payment started.
   * Without this, a user who takes an hour to pay would already have
   * lost an hour of their paid duration before ever getting access.
   */
  activate(id: string, expiresAt: Date): Promise<MembershipEntity>;
}

export const MEMBERSHIP_REPOSITORY = Symbol("MEMBERSHIP_REPOSITORY");

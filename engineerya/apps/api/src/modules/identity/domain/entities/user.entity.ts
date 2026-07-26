import { UserRole } from "@engineerya/shared-types";

/**
 * Domain entity. Deliberately NOT the Prisma model — this is what the
 * application/use-case layer reasons about, so business rules never
 * depend on ORM shape. Infrastructure maps Prisma rows to/from this.
 */
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly passwordHash: string | null,
    public readonly oauthProvider: string | null,
    public readonly createdAt: Date
  ) {}

  get isOAuthOnly(): boolean {
    return this.passwordHash === null;
  }

  hasRole(...roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }
}

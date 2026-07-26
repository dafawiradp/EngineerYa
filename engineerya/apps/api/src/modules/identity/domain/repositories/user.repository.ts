import { UserRole } from "@engineerya/shared-types";
import { UserEntity } from "../entities/user.entity";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string | null;
  oauthProvider?: string | null;
  oauthId?: string | null;
  role?: UserRole;
}

/**
 * Port (interface). The application layer depends only on this — the
 * concrete Prisma implementation lives in infrastructure/ and is bound
 * via DI token in identity.module.ts. This is what lets the persistence
 * technology change without touching a single use case.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findByOAuth(provider: string, oauthId: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
  listPaginated(page: number, pageSize: number): Promise<{ items: UserEntity[]; total: number }>;
  updateRole(id: string, role: UserRole): Promise<UserEntity>;
  count(): Promise<number>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

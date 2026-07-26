import { Injectable } from "@nestjs/common";
import { User as PrismaUser } from "@engineerya/database";
import { UserRole } from "@engineerya/shared-types";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserInput, IUserRepository } from "../../domain/repositories/user.repository";

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByOAuth(provider: string, oauthId: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findFirst({
      where: { oauthProvider: provider, oauthId },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        oauthProvider: input.oauthProvider ?? null,
        oauthId: input.oauthId ?? null,
        role: (input.role ?? UserRole.USER) as PrismaUser["role"],
      },
    });
    return this.toDomain(row);
  }

  async listPaginated(page: number, pageSize: number): Promise<{ items: UserEntity[]; total: number }> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count(),
    ]);
    return { items: rows.map(this.toDomain), total };
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { role: role as PrismaUser["role"] },
    });
    return this.toDomain(row);
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  private toDomain(row: PrismaUser): UserEntity {
    return new UserEntity(
      row.id,
      row.email,
      row.name,
      row.role as UserRole,
      row.passwordHash,
      row.oauthProvider,
      row.createdAt
    );
  }
}

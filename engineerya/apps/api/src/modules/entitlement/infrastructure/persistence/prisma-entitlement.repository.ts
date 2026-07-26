import { Injectable } from "@nestjs/common";
import { Entitlement as PrismaEntitlement, Prisma } from "@engineerya/database";
import { EntitlementSource, EntitlementType } from "@engineerya/shared-types";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { EntitlementEntity } from "../../domain/entities/entitlement.entity";
import { IEntitlementRepository } from "../../domain/repositories/entitlement.repository";

@Injectable()
export class PrismaEntitlementRepository implements IEntitlementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(userId: string, bookId: string, type: EntitlementType): Promise<boolean> {
    const row = await this.prisma.entitlement.findUnique({
      where: { userId_bookId_type: { userId, bookId, type } },
    });
    return row !== null;
  }

  async listForUser(userId: string): Promise<EntitlementEntity[]> {
    const rows = await this.prisma.entitlement.findMany({ where: { userId } });
    return rows.map(this.toDomain);
  }

  async grant(userId: string, bookId: string, type: EntitlementType, source: EntitlementSource): Promise<void> {
    try {
      await this.prisma.entitlement.create({ data: { userId, bookId, type, source } });
    } catch (err) {
      // P2002 = unique constraint violation — the entitlement was already
      // granted (e.g. a retried webhook). That's success, not an error.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return;
      }
      throw err;
    }
  }

  private toDomain(row: PrismaEntitlement): EntitlementEntity {
    return new EntitlementEntity(
      row.id,
      row.userId,
      row.bookId,
      row.type as EntitlementType,
      row.source as EntitlementSource,
      row.grantedAt
    );
  }
}
